import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkPLYReader from '@kitware/vtk.js/IO/Geometry/PLYReader';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkPoints from '@kitware/vtk.js/Common/Core/Points';
import vtkCellArray from '@kitware/vtk.js/Common/Core/CellArray';

import { addGroupedControl } from "./utils";
import { layersPanel } from "./UI";
import { showLoadingScreen, hideLoadingScreen } from "../../loadingManager";
import { horizontalClipPlane, horizontalClipPlane2, verticalClipPlane, verticalClipPlane2 } from "./clippingPlane";
import { renderer, renderWindow, fullScreenRenderer } from "./vtkRenderer";
/**
 * Function to load PLY files into the scene.
 * @param {string} url - Path to the PLY file.
 * @param {number} opacity - Opacity of the object.
 * @param {string} toggleClass - Class name for the visibility toggle.
 * @param {string} sliderId - ID of the opacity slider.
 * @param {number} representation - Representation mode (0 = Points, 1 = Wireframe, 2 = Surface).
 * @param {boolean} isVisible - Whether the actor should be visible on first render.
 */
function loadPLYFile(filename, opacity, toggleClass, sliderId, representation = 2, lineWidth=1, isVisible = true) {
    showLoadingScreen();
    const reader = vtkPLYReader.newInstance();
    const basePath = import.meta.env.BASE_URL || '/'; // Default to root `/` if not set
    const modelPath = `${basePath}models/${filename}`; // Correctly join paths
    reader.setUrl(modelPath).then(() => {
        const polydata = reader.getOutputData();

        // ✅ Log the model bounds
        const bounds = polydata.getBounds(); // [minX, maxX, minY, maxY, minZ, maxZ]
        console.log(`Model Extents for ${filename}:`, bounds);

        const mapper = vtkMapper.newInstance();
        mapper.addInputData(polydata);

        mapper.addClippingPlane(verticalClipPlane);   // ✅ Apply vertical clipping
        mapper.addClippingPlane(verticalClipPlane2);   // ✅ Apply vertical clipping
        mapper.addClippingPlane(horizontalClipPlane); // ✅ Apply horizontal clipping
        mapper.addClippingPlane(horizontalClipPlane2); // ✅ Apply horizontal clipping
        
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
        hideLoadingScreen();
        setTimeout(() => {
            renderer.resetCamera();  // Ensure the camera resets to include the model
            renderWindow.render();   // Manually refresh the rendering pipeline
        }, 100);
    }).catch(error => {
        console.error(`Error loading ${filename}:`, error);
        hideLoadingScreen();
        document.getElementById("loading-screen").innerHTML = "<p>⚠️ Error loading model</p>";});
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
function loadPLYWithPointsAndLines(filename, lineWidth = 2, lineColor = [1, 1, 1], pointSize = 5, pointColor = [1, 0, 0], isVisible = true) {
    showLoadingScreen();
    const basePath = import.meta.env.BASE_URL || '/'; // Default to root `/` if not set
    const modelPath = `${basePath}models/${filename}`; // Correctly join paths
    const reader = vtkPLYReader.newInstance();
    reader.setUrl(modelPath).then(() => {
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

        lineMapper.addClippingPlane(verticalClipPlane);   // ✅ Apply vertical clipping
        lineMapper.addClippingPlane(verticalClipPlane2);   // ✅ Apply vertical clipping
        lineMapper.addClippingPlane(horizontalClipPlane); // ✅ Apply horizontal clipping
        lineMapper.addClippingPlane(horizontalClipPlane2); // ✅ Apply horizontal clipping

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

        pointMapper.addClippingPlane(verticalClipPlane);   // ✅ Apply vertical clipping
        pointMapper.addClippingPlane(verticalClipPlane2);   // ✅ Apply vertical clipping
        pointMapper.addClippingPlane(horizontalClipPlane); // ✅ Apply horizontal clipping
        pointMapper.addClippingPlane(horizontalClipPlane2); // ✅ Apply horizontal clipping

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
        hideLoadingScreen();
        setTimeout(() => {
            renderer.resetCamera();  // Ensure the camera resets to include the model
            renderWindow.render();   // Manually refresh the rendering pipeline
        }, 100);
    }).catch(error => {
        console.error(`Error loading PLY file:`, error);
        hideLoadingScreen();
        document.getElementById('loading-screen').innerHTML = "<p>⚠️ Error loading model</p>";
    });
}

fullScreenRenderer.addController(layersPanel)

setTimeout(() => {
    const panels = document.querySelectorAll("#viewer-container > div"); // Get all divs inside #viewer-container
    const controlPanel = panels[panels.length - 1]; // Select the last added div (which is the control panel)

    if (controlPanel) {
        document.body.appendChild(controlPanel); // Move it outside of the viewer
        controlPanel.classList.add("control-panel");
        controlPanel.style.position = "fixed";
        controlPanel.style.top = "10%";
        // controlPanel.style.transform = "translateY(-50%)";
        controlPanel.style.left = "0px";
        controlPanel.style.background = "rgba(92, 92, 92, 0.29)";
        controlPanel.style.padding = "1%";
        controlPanel.style.borderRadius = "0 2% 2% 0";
        controlPanel.style.boxShadow = "4px 4px 12px rgba(0, 0, 0, 0.5)";
        controlPanel.style.zIndex = "900";
        controlPanel.style.width = "16%"; // ✅ Fix: Set fixed width
        controlPanel.style.maxWidth = "300px"; // ✅ Prevents it from stretching
        controlPanel.style.color = 'white';
        controlPanel.style.fontSize = '90%';
    }
}, 100); // Delay to ensure it's loaded before moving

export { loadPLYFile, loadPLYWithPointsAndLines }
