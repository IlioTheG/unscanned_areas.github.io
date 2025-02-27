import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkAxesActor from '@kitware/vtk.js/Rendering/Core/AxesActor';
import vtkOrientationMarkerWidget from '@kitware/vtk.js/Interaction/Widgets/OrientationMarkerWidget';


// Initialize the full-screen renderer
const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    rootContainer: document.getElementById('viewer-container'),
});

const renderer = fullScreenRenderer.getRenderer();
renderer.setBackground(0.2, 0.2, 0.2, 1);
const renderWindow = fullScreenRenderer.getRenderWindow();

const axes = vtkAxesActor.newInstance();

const orientationMarkerWidget = vtkOrientationMarkerWidget.newInstance({
  actor: axes,
  interactor: renderWindow.getInteractor(), // <-- important!
});


orientationMarkerWidget.setEnabled(true);
orientationMarkerWidget.setViewportCorner(
  vtkOrientationMarkerWidget.Corners.BOTTOM_LEFT
);
orientationMarkerWidget.setViewportSize(0.05); // 15% of the view
orientationMarkerWidget.setMinPixelSize(50);
orientationMarkerWidget.setMaxPixelSize(200);

export { renderer, renderWindow, fullScreenRenderer };
