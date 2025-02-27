import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import { loadPLYFile, loadPLYWithPointsAndLines } from './public/js/plyLoader.js';
import { addClipPlaneControlPanel } from './public/js/UI.js';
import { renderer, renderWindow, fullScreenRenderer } from './public/js/vtkRenderer.js';


// Load PLY files with correct representation modes and initial visibility
loadPLYFile('pointcloud2.ply', 1.0, 'togglePointCloud', 'opacity-slider-pointcloud', 0, 0, true); // Points, visible
loadPLYFile('Scanned.ply', 0.9, 'toggleScanned', 'opacity-slider-scanned', 2, 0, false); // Surface, visible
loadPLYFile('mesh.ply', 0.1, 'toggleMesh', 'opacity-slider-mesh-voxels', 2, 0, false); // Surface, initially hidden
loadPLYFile('Seen.ply', 0.4, 'toggleVoidVoxels', 'opacity-slider-void-voxels', 2, 0, false); // Surface, initially hidden
loadPLYFile('Unknown.ply', 0.4, 'toggleUnknownVoxels', 'opacity-slider-unknown-voxels', 2, 0, false); // Surface, initially hidden
loadPLYFile('hull_new.ply', 0.4, 'toggleHull', 'opacity-slider-building-hull', 2, 0, false); // Surface, initially hidden
loadPLYWithPointsAndLines('camera_line.ply', 1, [1, 1, 1], 3, [1, 0, 0])

addClipPlaneControlPanel();

document.addEventListener("DOMContentLoaded", () => {
    const collapsibleBtn = document.querySelector(".collapsible-btn");
    const collapsibleContainer = document.querySelector(".collapsible-container");

    collapsibleBtn.addEventListener("click", () => {
        collapsibleContainer.classList.toggle("open");
    });
});
