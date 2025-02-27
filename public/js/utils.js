import { renderWindow } from "./vtkRenderer";
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

export {addGroupedControl}