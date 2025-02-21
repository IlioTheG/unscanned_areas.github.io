import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import vtkActor           from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper          from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkPoints from '@kitware/vtk.js/Common/Core/Points';
import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData';
import vtkCalculator      from '@kitware/vtk.js/Filters/General/Calculator';
import vtkConeSource      from '@kitware/vtk.js/Filters/Sources/ConeSource';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import vtkPLYReader from '@kitware/vtk.js/IO/Geometry/PLYReader';
import { AttributeTypes } from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';

const controlPanel = `
<table>
    <tr>
        <td>
            <label>
                <b>Toggle layers</b>
            </label>
        </td>
        <td>
            <label>
                <b>Set opacity</b>
            </label>
        </td>
    </tr>

    <tr>
        <td>
            <label>
            <input type="checkbox" class="toggleMesh" checked />
            Mesh
            </label>
        </td>
        <td>
                <input type="range" id="opacity-slider-mesh-voxels" min="0" max="1" step="0.1" value="0.1">
        </td>
    </tr>

    <tr>
        <td>
            <label>
                <input type="checkbox" class="toggleScanned" checked />
                Scanned voxel
            </label>
        </td>
        <td>
            <input type="range" id="opacity-slider-scanned" min="0" max="1" step="0.1" value="0.9">
        </td>
    </tr>

    <tr>
        <td>
            <label>
                <input type="checkbox" class="toggleVoidVoxels" />
                Void voxels
            </label>
        </td>
        <td>
            <input type="range" id="opacity-slider-void-voxels" min="0" max="1" step="0.1" value="0.4">
        </td>
    </tr>

    <tr>
        <td>
            <label>
                <input type="checkbox" class="toggleUnknownVoxels" />
                Unknown voxels
            </label>
        </td>
        <td>
            <input type="range" id="opacity-slider-unknown-voxels" min="0" max="1" step="0.1" value="0.4">
        </td>
    </tr>
</table>
`;



// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    rootContainer: document.getElementById('viewer-container'),
});
const renderer = fullScreenRenderer.getRenderer();
renderer.setBackground(0.2, 0.2, 0.2);
const renderWindow = fullScreenRenderer.getRenderWindow();

// -----------------------------------------------------------
// Read a PLY file and add it to the scene
// -----------------------------------------------------------
const pointCloudReader = vtkPLYReader.newInstance();
pointCloudReader.setUrl('/public/models/pointcloud2.ply').then(() => {
    const pcdPolydata = pointCloudReader.getOutputData();
    
    const pcdMapper = vtkMapper.newInstance();
    pcdMapper.addInputData(pcdPolydata);
    pcdMapper.setScalarModeToUsePointFieldData();
    pcdMapper.setScalarVisibility(true);
    pcdMapper.setColorModeToDefault();
    
    const pcdActor = vtkActor.newInstance();
    pcdActor.getProperty().setRepresentation(0); // 0 = Points
    pcdActor.getProperty().setPointSize(2);      // enlarge points
    // pcdActor.getProperty().setColor(1, 0, 0);    // white points, for visibility
    pcdActor.setMapper(pcdMapper);
    
    renderer.addActor(pcdActor);
    renderer.resetCamera();
    renderWindow.render();
}).catch((error) => {
    console.error('Error loading PLY:', error);
});

// -----------------------
//      SCANNED voxels
// -----------------------
const scannedVoxelsReader =vtkPLYReader.newInstance();
scannedVoxelsReader.setUrl('/public/models/Scanned.ply').then(() => {
    const meshPolydata = scannedVoxelsReader.getOutputData();

    const meshMapper = vtkMapper.newInstance();
    meshMapper.addInputData(meshPolydata);
    
    const scannedVoxelsActor = vtkActor.newInstance();
    scannedVoxelsActor.setMapper(meshMapper);
    scannedVoxelsActor.getProperty().setOpacity(0.9);
    renderer.addActor(scannedVoxelsActor);
    renderer.resetCamera();
    renderWindow.render();

    scannedVoxelsToggle.addEventListener('change', () => {
        scannedVoxelsActor.setVisibility(scannedVoxelsToggle.checked);
        renderWindow.render();
    });

    const opacitySlider = document.getElementById("opacity-slider-scanned");
    opacitySlider.addEventListener("input", (event) => {
    const opacity = parseFloat(event.target.value);
    scannedVoxelsActor.getProperty().setOpacity(opacity);
    renderWindow.render();
    });

})

// -----------------------
//      MESH voxels
// -----------------------
const meshReader =vtkPLYReader.newInstance();
meshReader.setUrl('/public/models/mesh.ply').then(() => {
    const meshPolydata = meshReader.getOutputData();

    const meshMapper = vtkMapper.newInstance();
    meshMapper.addInputData(meshPolydata);
    
    const meshActor = vtkActor.newInstance();
    meshActor.setMapper(meshMapper);
    meshActor.getProperty().setOpacity(0.1);
    renderer.addActor(meshActor);
    renderer.resetCamera();
    renderWindow.render();

    meshToggle.addEventListener('change', () => {
        meshActor.setVisibility(meshToggle.checked);
        renderWindow.render();
    });

    const opacitySlider = document.getElementById("opacity-slider-mesh-voxels");
    opacitySlider.addEventListener("input", (event) => {
    const opacity = parseFloat(event.target.value);
    meshActor.getProperty().setOpacity(opacity);
    renderWindow.render();
    });
})


// -----------------------
//      VOID voxels
// -----------------------
const voidVoxelsReader =vtkPLYReader.newInstance();
voidVoxelsReader.setUrl('/public/models/Seen.ply').then(() => {
    const meshPolydata = voidVoxelsReader.getOutputData();

    const meshMapper = vtkMapper.newInstance();
    meshMapper.addInputData(meshPolydata);
    
    const voidVoxelsActor = vtkActor.newInstance();
    voidVoxelsActor.setMapper(meshMapper);
    voidVoxelsActor.getProperty().setOpacity(0.4);
    voidVoxelsActor.setVisibility(false);
    renderer.addActor(voidVoxelsActor);
    renderer.resetCamera();
    renderWindow.render();

    voidVoxelsToggle.addEventListener('change', () => {
        voidVoxelsActor.setVisibility(voidVoxelsToggle.checked);
        renderWindow.render();
    });

    const opacitySlider = document.getElementById("opacity-slider-void-voxels");
    opacitySlider.addEventListener("input", (event) => {
    const opacity = parseFloat(event.target.value);
    voidVoxelsActor.getProperty().setOpacity(opacity);
    renderWindow.render();
    });
})

// -----------------------
//      UNKNOWN voxels
// -----------------------
const unknownVoxelsReader =vtkPLYReader.newInstance();
unknownVoxelsReader.setUrl('/public/models/Unknown.ply').then(() => {
    const meshPolydata = unknownVoxelsReader.getOutputData();

    const meshMapper = vtkMapper.newInstance();
    meshMapper.addInputData(meshPolydata);
    
    const unknownVoxelsActor = vtkActor.newInstance();
    unknownVoxelsActor.setMapper(meshMapper);
    unknownVoxelsActor.getProperty().setOpacity(0.4);
    unknownVoxelsActor.setVisibility(false);
    renderer.addActor(unknownVoxelsActor);
    renderer.resetCamera();
    renderWindow.render();

    unknownVoxelsToggle.addEventListener('change', () => {
        unknownVoxelsActor.setVisibility(unknownVoxelsToggle.checked);
        renderWindow.render();
    });

    const opacitySlider = document.getElementById("opacity-slider-void-voxels");
    opacitySlider.addEventListener("input", (event) => {
    const opacity = parseFloat(event.target.value);
    unknownVoxelsActor.getProperty().setOpacity(opacity);
    renderWindow.render();
    });
})




// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

// // After adding the table
const meshToggle = document.querySelector('.toggleMesh');
const scannedVoxelsToggle = document.querySelector('.toggleScanned');
const voidVoxelsToggle = document.querySelector('.toggleVoidVoxels');
const unknownVoxelsToggle = document.querySelector('.toggleUnknownVoxels');



