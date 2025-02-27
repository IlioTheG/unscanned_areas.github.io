import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

// Initialize the full-screen renderer
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    rootContainer: document.getElementById('viewer-container'),
});

const renderer = fullScreenRenderer.getRenderer();
renderer.setBackground(0.2, 0.2, 0.2, 1);
const renderWindow = fullScreenRenderer.getRenderWindow();

export { renderer, renderWindow, fullScreenRenderer };
