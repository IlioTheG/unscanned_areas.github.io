import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkPLYReader from '@kitware/vtk.js/IO/Geometry/PLYReader';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkPoints from '@kitware/vtk.js/Common/Core/Points';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray';


// UI control panel
const controlPanel = `
<div class="vtk-container">
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
            <td><label><input type="checkbox" class="toggleMesh" checked /> Mesh voxels</label></td>
            <td><input type="range" id="opacity-slider-mesh-voxels" min="0" max="1" step="0.1" value="0.1"></td>
        </tr>
        <tr>
            <td><div class="quadrant-box scanned-color"></div></td>
            <td><label><input type="checkbox" class="toggleScanned" checked /> Scanned voxel</label></td>
            <td><input type="range" id="opacity-slider-scanned" min="0" max="1" step="0.1" value="0.9"></td>
        </tr>
        <tr>
            <td><div class="legend-box voidvoxels-color"></div></td>
            <td><label><input type="checkbox" class="toggleVoidVoxels" /> Void voxels</label></td>
            <td><input type="range" id="opacity-slider-void-voxels" min="0" max="1" step="0.1" value="0.4"></td>
        </tr>
        <tr>
            <td><div class="legend-box unknownvoxels-color"></div></td>
            <td><label><input type="checkbox" class="toggleUnknownVoxels" /> Unknown voxels</label></td>
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


// Initialize rendering window
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    rootContainer: document.getElementById('viewer-container'),
});
const renderer = fullScreenRenderer.getRenderer();
renderer.setBackground(0.2, 0.2, 0.2, 1);
const renderWindow = fullScreenRenderer.getRenderWindow();


/**
 * Function to load PLY files into the scene.
 * @param {string} url - Path to the PLY file.
 * @param {number} opacity - Opacity of the object.
 * @param {string} toggleClass - Class name for the visibility toggle.
 * @param {string} sliderId - ID of the opacity slider.
 * @param {number} representation - Representation mode (0 = Points, 1 = Wireframe, 2 = Surface).
 * @param {boolean} isVisible - Whether the actor should be visible on first render.
 */
function loadPLYFile(url, opacity, toggleClass, sliderId, representation = 2, lineWidth=1, isVisible = true) {
    const reader = vtkPLYReader.newInstance();
    reader.setUrl(url).then(() => {
        const polydata = reader.getOutputData();
        const mapper = vtkMapper.newInstance();
        mapper.addInputData(polydata);
        
        const actor = vtkActor.newInstance();
        actor.setMapper(mapper);
        actor.getProperty().setOpacity(opacity);
        actor.getProperty().setRepresentation(representation); // Set representation mode
        if (representation === 1) {
            actor.getProperty().setLineWidth(lineWidth); // Set line width only for wireframe mode
        }
        actor.setVisibility(isVisible); // Set initial visibility
        renderer.addActor(actor);
        renderer.resetCamera();
        renderWindow.render();

        // Handle UI controls
        const toggle = document.querySelector(`.${toggleClass}`);
        const opacitySlider = document.getElementById(sliderId);

        if (toggle) {
            toggle.checked = isVisible; // Set checkbox state based on initial visibility
            toggle.addEventListener('change', () => {
                actor.setVisibility(toggle.checked);
                renderWindow.render();
            });
        }

        if (opacitySlider) {
            opacitySlider.addEventListener("input", (event) => {
                actor.getProperty().setOpacity(parseFloat(event.target.value));
                renderWindow.render();
            });
        }
    }).catch(error => console.error(`Error loading ${url}:`, error));
}

/**
 * Function to add a single control for two linked actors in the control panel with a line representation.
 * @param {string} label - Label name.
 * @param {Array} actors - The array of vtkActors to control.
 * @param {string} toggleClass - Class name for the visibility checkbox.
 * @param {string} sliderId - ID of the opacity slider.
 */
function addGroupedControl(label, actors, toggleClass, sliderId) {
    const controlPanel = document.querySelector(".vtk-container table");
    if (!controlPanel) return;

    // Create a new row
    const row = document.createElement("tr");
    
    // Create a legend with a small line and dots
    const legendCell = document.createElement("td");
    const legendCanvas = document.createElement("canvas");
    legendCanvas.width = 40;
    legendCanvas.height = 10;
    legendCanvas.classList.add("legend-line");
    drawLegendLine(legendCanvas, actors[0].getProperty().getColor());
    legendCell.appendChild(legendCanvas);
    row.appendChild(legendCell);

    // Create toggle checkbox
    const toggleCell = document.createElement("td");
    const toggleLabel = document.createElement("label");
    toggleLabel.innerHTML = `<input type="checkbox" class="${toggleClass}" checked /> ${label}`;
    toggleCell.appendChild(toggleLabel);
    row.appendChild(toggleCell);


    // Create opacity slider
    const sliderCell = document.createElement("td");
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = "0";
    slider.max = "1";
    slider.step = "0.1";
    slider.value = "1.0";
    slider.id = sliderId;
    sliderCell.appendChild(slider);
    row.appendChild(sliderCell);

    // Append row to control panel
    controlPanel.appendChild(row);

    // Add event listeners for interactivity
    const toggle = document.querySelector(`.${toggleClass}`);
    toggle.addEventListener("change", () => {
        actors.forEach(actor => actor.setVisibility(toggle.checked));
        renderWindow.render();
    });

    slider.addEventListener("input", (event) => {
        actors.forEach(actor => actor.getProperty().setOpacity(parseFloat(event.target.value)));
        renderWindow.render();
    });
}

/**
 * Function to load a PLY file, visualize both the points and the connected lines, and link them to a single control panel entry.
 * @param {string} url - Path to the PLY file.
 * @param {number} lineWidth - Width of the lines.
 * @param {array} lineColor - RGB color for the lines.
 * @param {number} pointSize - Size of the points.
 * @param {array} pointColor - RGB color for the points.
 * @param {boolean} isVisible - Whether the actors should be visible on first render.
 */
function loadPLYWithPointsAndLines(url, lineWidth = 2, lineColor = [1, 1, 1], pointSize = 5, pointColor = [1, 0, 0], isVisible = true) {
    const reader = vtkPLYReader.newInstance();
    reader.setUrl(url).then(() => {
        const polyData = reader.getOutputData();

        // Extract points from the PLY file
        const points = vtkPoints.newInstance();
        const pointArray = polyData.getPoints().getData();

        for (let i = 0; i < pointArray.length; i += 3) {
            points.insertNextPoint(pointArray[i], pointArray[i + 1], pointArray[i + 2]);
        }

        // Create a polyline (connecting all points in order)
        const lines = vtkCellArray.newInstance();
        const numPoints = points.getNumberOfPoints();
        const connectivity = new Uint16Array(numPoints + 1);
        connectivity[0] = numPoints; // First value is the number of points

        for (let i = 0; i < numPoints; i++) {
            connectivity[i + 1] = i;
        }

        lines.setData(connectivity);

        // Create a polydata for the line
        const polyDataWithLines = vtkPolyData.newInstance();
        polyDataWithLines.setPoints(points);
        polyDataWithLines.setLines(lines);

        // Create a mapper and actor for the line
        const lineMapper = vtkMapper.newInstance();
        lineMapper.setInputData(polyDataWithLines);

        const lineActor = vtkActor.newInstance();
        lineActor.setMapper(lineMapper);
        lineActor.getProperty().setColor(...lineColor); // Set line color
        lineActor.getProperty().setLineWidth(lineWidth); // Set line width
        lineActor.setVisibility(isVisible);

        // --- FIX: Ensure points are rendered correctly ---
        const verts = vtkCellArray.newInstance();
        const vertsData = new Uint16Array(numPoints * 2);

        for (let i = 0; i < numPoints; i++) {
            vertsData[i * 2] = 1; // Each cell contains 1 point
            vertsData[i * 2 + 1] = i; // The index of the point
        }

        verts.setData(vertsData);

        // Create a polydata for the points
        const polyDataWithPoints = vtkPolyData.newInstance();
        polyDataWithPoints.setPoints(points);
        polyDataWithPoints.setVerts(verts);

        // Create a mapper and actor for the points
        const pointMapper = vtkMapper.newInstance();
        pointMapper.setInputData(polyDataWithPoints);

        const pointActor = vtkActor.newInstance();
        pointActor.setMapper(pointMapper);
        pointActor.getProperty().setColor(...pointColor); // Set point color
        pointActor.getProperty().setRepresentation(0); // 0 = Points
        pointActor.getProperty().setPointSize(pointSize); // Set point size
        pointActor.setVisibility(isVisible);

        // Add both actors to the renderer
        renderer.addActor(lineActor);
        renderer.addActor(pointActor);
        renderer.resetCamera();
        renderWindow.render();

        // --- Add UI Control for Both Actors ---
        addGroupedControl("Camera trajectory", [lineActor, pointActor], "toggleLinePoints", "opacity-slider-linepoints");
    }).catch(error => console.error(`Error loading PLY file:`, error));
}


/**
 * Function to draw a small line with points on a canvas for the control panel legend.
 * @param {HTMLCanvasElement} canvas - The canvas element to draw on.
 * @param {Array} color - RGB color array for the line and points.
 */
function drawLegendLine(canvas, color) {
    const ctx = canvas.getContext("2d");

    // Convert RGB values to CSS color
    const rgbColor = `rgb(${color.map(c => c * 255).join(",")})`;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the line
    ctx.strokeStyle = rgbColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(5, canvas.height / 2);
    ctx.lineTo(canvas.width - 5, canvas.height / 2);
    ctx.stroke();

    // Draw the points
    ctx.fillStyle = rgbColor;
    const pointPositions = [5, 20, 35]; // X positions for 3 sample points
    pointPositions.forEach(x => {
        ctx.beginPath();
        ctx.arc(x, canvas.height / 2, 2, 0, 2 * Math.PI);
        ctx.fill();
    });
}

// Load PLY files with correct representation modes and initial visibility
loadPLYFile('/public/models/pointcloud2.ply', 1.0, 'togglePointCloud', 'opacity-slider-pointcloud', 0, 0, true); // Points, visible
loadPLYFile('/public/models/Scanned.ply', 0.9, 'toggleScanned', 'opacity-slider-scanned', 2, 0, true); // Surface, visible
loadPLYFile('/public/models/mesh.ply', 0.1, 'toggleMesh', 'opacity-slider-mesh-voxels', 2, 0, false); // Surface, initially hidden
loadPLYFile('/public/models/Seen.ply', 0.4, 'toggleVoidVoxels', 'opacity-slider-void-voxels', 2, 0, false); // Surface, initially hidden
loadPLYFile('/public/models/Unknown.ply', 0.4, 'toggleUnknownVoxels', 'opacity-slider-unknown-voxels', 2, 0, false); // Surface, initially hidden
loadPLYFile('/public/models/hull_new.ply', 0.4, 'toggleHull', 'opacity-slider-building-hull', 2, 0, false); // Surface, initially hidden
// loadPLYFile('/public/models/camera_line2.ply', 1.0, 'toggleCamera', 'opacity-slider-camera-line', 1, 2, true); // Surface, initially hidden
loadPLYWithPointsAndLines('/public/models/camera_line.ply', 1, [1, 1, 1], 3, [1, 0, 0])
// Add UI controls
fullScreenRenderer.addController(controlPanel);

setTimeout(() => {
    const panels = document.querySelectorAll("#viewer-container > div"); // Get all divs inside #viewer-container
    const controlPanel = panels[panels.length - 1]; // Select the last added div (which is the control panel)

    if (controlPanel) {
        document.body.appendChild(controlPanel); // Move it outside of the viewer
        controlPanel.classList.add("control-panel");
        controlPanel.style.position = "fixed";
        controlPanel.style.top = "50%";
        controlPanel.style.transform = "translateY(-50%)";
        controlPanel.style.left = "0px";
        controlPanel.style.background = "rgba(92, 92, 92, 0.29)";
        controlPanel.style.padding = "20px";
        controlPanel.style.borderRadius = "0 8px 8px 0";
        controlPanel.style.boxShadow = "4px 4px 12px rgba(0, 0, 0, 0.5)";
        controlPanel.style.zIndex = "900";
        controlPanel.style.width = "300px"; // ✅ Fix: Set fixed width
        controlPanel.style.maxWidth = "300px"; // ✅ Prevents it from stretching
        // Opacity effect on hover
        controlPanel.addEventListener("mouseenter", () => {
            controlPanel.style.opacity = "1";
            // controlPanel.style.transform = "translateY(-50%) scale(1.02)";
        });

        controlPanel.addEventListener("mouseleave", () => {
            controlPanel.style.opacity = "0.8";
            // controlPanel.style.transform = "translateY(-50%) scale(1)";
        });
    }
}, 100); // Delay to ensure it's loaded before moving

document.addEventListener("DOMContentLoaded", () => {
    const collapsibleBtn = document.querySelector(".collapsible-btn");
    const collapsibleContainer = document.querySelector(".collapsible-container");

    collapsibleBtn.addEventListener("click", () => {
        collapsibleContainer.classList.toggle("open");
    });
});
