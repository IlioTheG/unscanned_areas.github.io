import { horizontalClipPlane, horizontalClipPlane2, verticalClipPlane, verticalClipPlane2, zAxisClipPlane, zAxisClipPlane2 } from "./clippingPlane";
import { renderWindow } from "./vtkRenderer";

function addClipPlaneControlPanel() {
    const clipPanel = document.createElement("div");
    clipPanel.id = "clip-plane-panel";
    clipPanel.className = 'clip-plane-panel'
    clipPanel.innerHTML = `
        <b>Clipping Planes</b>
        <br>
        <br>
        <label>Vertical Clip (L->R):</label>
        <input type="range" id="vertical-clip-slider" min="-13" max="7.5" step="0.01" value="-13">
        <br>
        <label>Vertical Clip (R->L):</label>
        <input type="range" id="vertical-clip-slider-2" min="-13" max="7.5" step="0.01" value="7.5">
        <br>
        <label>Horizontal Clip (B->T):</label>
        <input type="range" id="horizontal-clip-slider" min="-2" max="7" step="0.01" value="-2">
        <br>
        <label>Horizontal Clip (T->B):</label>
        <input type="range" id="horizontal-clip-slider-2" min="-2" max="7" step="0.01" value="7">
        <br>
        <label>Depth clip (N->F):</label>
        <input type="range" id="z-axis-clip-slider" min="-1.7" max="7" step="0.1" value="7">
        <br>
        <label>Depth clip (F->N):</label>
        <input type="range" id="z-axis-clip-slider-2" min="-1.7" max="7" step="0.01" value="-1.7">

    `;
    
    document.body.appendChild(clipPanel);

    // Update vertical clipping plane dynamically
    document.getElementById("vertical-clip-slider").addEventListener("input", (event) => {
        const newOrigin = parseFloat(event.target.value);
        verticalClipPlane.setOrigin(newOrigin, 0, 0);
        renderWindow.render();
    });
    document.getElementById("vertical-clip-slider-2").addEventListener("input", (event) => {
        const newOrigin = parseFloat(event.target.value);
        verticalClipPlane2.setOrigin(newOrigin, 0, 0);
        renderWindow.render();
    });

    document.getElementById("horizontal-clip-slider").addEventListener("input", (event) => {
        const newOrigin = parseFloat(event.target.value);
        horizontalClipPlane.setOrigin(0, newOrigin, 0);
        renderWindow.render();
    });
    document.getElementById("horizontal-clip-slider-2").addEventListener("input", (event) => {
        const newOrigin = parseFloat(event.target.value);
        horizontalClipPlane2.setOrigin(0, newOrigin, 0);
        renderWindow.render();
    });
    
    document.getElementById("z-axis-clip-slider").addEventListener("input", (event) => {
        const newOrigin = parseFloat(event.target.value);
        zAxisClipPlane.setOrigin(0, 0, newOrigin);
        renderWindow.render();
    });
    document.getElementById("z-axis-clip-slider-2").addEventListener("input", (event) => {
        const newOrigin = parseFloat(event.target.value);
        zAxisClipPlane2.setOrigin(0, 0, newOrigin);
        renderWindow.render();
    });
}

const layersPanel = `
<div style="
    overflow: visible;
  " class="vtk-container">
    <table>
        <tr>
            <td></td>
            <td><b>Toggle layers</b></td>
            <td><b>Set opacity</b></td>
        </tr>
        <tr>
            <td><div class="circular-box pointcloud-color"></div></td>
            <td><label><input type="checkbox" class="togglePointCloud" checked /> Point Cloud</label></td>
            <td><input type="range" id="opacity-slider-pointcloud" min="0" max="1" step="0.1" value="1.0"></td>
        </tr>
        <tr>
            <td><div class="legend-box mesh-color"></div></td>
            <td><label><input type="checkbox" class="toggleMesh" /> Boundary voxels</label></td>
            <td><input type="range" id="opacity-slider-mesh-voxels" min="0" max="1" step="0.1" value="0.1"></td>
        </tr>
        <tr>
            <td><div class="quadrant-box scanned-color"></div></td>
            <td><label><input type="checkbox" class="toggleScanned" /> Occupied voxels</label></td>
            <td><input type="range" id="opacity-slider-scanned" min="0" max="1" step="0.1" value="0.9"></td>
        </tr>
        <tr>
            <td><div class="legend-box voidvoxels-color"></div></td>
            <td><label><input type="checkbox" class="toggleVoidVoxels" /> Void voxels</label></td>
            <td><input type="range" id="opacity-slider-void-voxels" min="0" max="1" step="0.1" value="0.4"></td>
        </tr>
        <tr>
            <td><div class="legend-box unknownvoxels-color"></div></td>
            <td><label><input type="checkbox" class="toggleUnknownVoxels" /> Unseen voxels</label></td>
            <td><input type="range" id="opacity-slider-unknown-voxels" min="0" max="1" step="0.1" value="0.4"></td>
        </tr>
        <tr>
            <td><div class="legend-box buildinghull-color"></div></td>
            <td><label><input type="checkbox" class="toggleHull" /> Building hull</label></td>
            <td><input type="range" id="opacity-slider-building-hull" min="0" max="1" step="0.1" value="0.4"></td>
        </tr>
    </table>
</div>
`;

export { addClipPlaneControlPanel, layersPanel }
