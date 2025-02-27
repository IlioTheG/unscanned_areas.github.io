import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';

// Create two clipping planes
const verticalClipPlane = vtkPlane.newInstance();
verticalClipPlane.setNormal(1, 0, 0); 
verticalClipPlane.setOrigin(-13, 0, 0);  // ✅ Set initial position of vertical clip plane
const verticalClipPlane2 = vtkPlane.newInstance();
verticalClipPlane2.setNormal(-1, 0, 0); 
verticalClipPlane2.setOrigin(7.5, 0, 0);  // ✅ Set initial position of vertical clip plane

const horizontalClipPlane = vtkPlane.newInstance();
horizontalClipPlane.setNormal(0, 1, 0);
horizontalClipPlane.setOrigin(0, -2, 0);  // ✅ Set initial position of horizontal clip plane
const horizontalClipPlane2 = vtkPlane.newInstance();
horizontalClipPlane2.setNormal(0, -1, 0);
horizontalClipPlane2.setOrigin(0, 7, 0);  // ✅ Set initial position of horizontal clip plane

export {verticalClipPlane, verticalClipPlane2, horizontalClipPlane, horizontalClipPlane2}