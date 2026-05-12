"""Precompute orientation map + top sum/difference modes for Fig 3.

Outputs JSON to public/data/balanced-amp/modes.json. Re-run on demand.
Matches Murphy & Miller (2009) Experimental Procedures.
"""
from __future__ import annotations

import json
import os
from pathlib import Path

import numpy as np


N = 32          # grid edge (32x32 neurons each for E and I)
GRID_MM = 4.0   # mm
N_PINWHEELS = 4
SIGMA_R_E = 4.0   # mm
SIGMA_R_I = 0.4   # mm
SIGMA_THETA = 20.0  # degrees
TOP_K = 5         # number of mode pairs to ship


def build_orientation_map() -> np.ndarray:
    """Return (N, N) array of preferred orientations in degrees [0, 180)."""
    cells_per_pin = N // N_PINWHEELS
    theta = np.zeros((N, N))
    for pi in range(N_PINWHEELS):
        for pj in range(N_PINWHEELS):
            flip_x = pj % 2 == 1
            flip_y = pi % 2 == 1
            for i in range(cells_per_pin):
                for j in range(cells_per_pin):
                    y = i - (cells_per_pin - 1) / 2
                    x = j - (cells_per_pin - 1) / 2
                    if flip_x:
                        x = -x
                    if flip_y:
                        y = -y
                    angle = (np.degrees(np.arctan2(y, x)) / 2.0) % 180.0
                    theta[pi * cells_per_pin + i, pj * cells_per_pin + j] = angle
    return theta


def gaussian_connectivity(theta: np.ndarray, sigma_r_mm: float, sigma_theta_deg: float) -> np.ndarray:
    """Build N^2 x N^2 connectivity matrix with Gaussian distance and orientation kernels."""
    coords_mm = np.linspace(0, GRID_MM, N, endpoint=False)
    yy, xx = np.meshgrid(coords_mm, coords_mm, indexing="ij")
    pos = np.stack([yy.flatten(), xx.flatten()], axis=1)  # (N^2, 2)
    th = theta.flatten()  # (N^2,)
    dpos = pos[:, None, :] - pos[None, :, :]
    r2 = (dpos ** 2).sum(axis=2)
    dth = th[:, None] - th[None, :]
    dth = ((dth + 90) % 180) - 90  # signed shortest angular distance
    W = np.exp(-r2 / sigma_r_mm**2) * np.exp(-(dth**2) / sigma_theta_deg**2)
    W = W / W.sum(axis=1, keepdims=True)
    return W.astype(np.float32)


def main() -> None:
    here = Path(__file__).resolve().parent
    out_dir = here.parent / "public" / "data" / "balanced-amp"
    out_dir.mkdir(parents=True, exist_ok=True)

    theta = build_orientation_map()
    print(f"Built {N}x{N} orientation map, range {theta.min():.1f}–{theta.max():.1f} deg")

    WE = gaussian_connectivity(theta, SIGMA_R_E, SIGMA_THETA)
    WI = gaussian_connectivity(theta, SIGMA_R_I, SIGMA_THETA)
    print(f"Built W_E and W_I, each {WE.shape}")

    M = WE + WI
    eigvals, eigvecs = np.linalg.eig(M)
    order = np.argsort(-np.abs(eigvals))
    eigvals = eigvals[order]
    eigvecs = eigvecs[:, order]
    real_mask = np.abs(eigvals.imag) < 1e-6
    eigvals = eigvals[real_mask].real
    eigvecs = eigvecs[:, real_mask].real

    print("Top 8 |w_FF|:", [float(v) for v in eigvals[:8]])

    top_modes = []
    for k in range(min(TOP_K, eigvecs.shape[1])):
        vec = eigvecs[:, k]
        vec = vec / (np.max(np.abs(vec)) or 1.0)
        diff_mode = {"E": vec.tolist(), "I": (-vec).tolist()}
        sum_mode = {"E": vec.tolist(), "I": vec.tolist()}
        top_modes.append({
            "index": k + 1,
            "wFF": float(eigvals[k]),
            "difference": diff_mode,
            "sum": sum_mode,
        })

    th_flat = theta.flatten()
    dq = ((th_flat - 0 + 90) % 180) - 90
    R_evoked = 4.0 * np.exp(-(dq ** 2) / (20.0 ** 2))
    R_evoked = R_evoked.reshape(N, N).tolist()

    out = {
        "N": N,
        "gridMm": GRID_MM,
        "orientationMap": theta.tolist(),
        "evokedMap0deg": R_evoked,
        "modes": top_modes,
    }

    out_path = out_dir / "modes.json"
    with out_path.open("w") as f:
        json.dump(out, f)
    print(f"Wrote {out_path} ({out_path.stat().st_size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
