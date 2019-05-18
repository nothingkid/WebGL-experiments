/**
 * helper for 'void'
 * creates magic box consisting of magic 3d little opaque boxes
 *
 * @param width
 * @param height
 * @param depth
 * @param xSegments Number of lines per x-axis
 * @param ySegments Number of lines per y-axis
 * @param zSegments Number of lines per z-axis
 * @param options Two options: 'wireframe' and 'cornerSides'.
 * 'wireframe' means no magic little boxes inside of box.
 * 'cornerSides': do not draw corner lines along y-axis if 'false'
 * @constructor
 */

let GridBox = function(width, height, depth, xSegments, ySegments, zSegments, options) {
    if (!options) {
        options = {};
    }

    if (options.cornerSides === undefined) {
        options.cornerSides = true;
    }

    THREE.Group.apply(this);

    //number of lines per axis
    xSegments = xSegments || 1;
    ySegments = ySegments || 1;
    zSegments = zSegments || 1;

    let xVertices = xSegments + 1;
    let yVertices = ySegments + 1;
    let zVertices = zSegments + 1;

    //length of line
    let xStep = Math.round(width / xSegments * 100) / 100;
    let yStep = Math.round(height / ySegments * 100) / 100;
    let zStep = Math.round(depth / zSegments * 100) / 100;

    // console.log('xStep', xStep);
    // console.log('yStep', yStep);
    // console.log('zStep', zStep);

    let positions = [];
    let vertices = [];
    for (let z = 0; z < zVertices; z += 1) {
        for (let y = 0; y < yVertices; y += 1) {
            for (let x = 0; x < xVertices; x += 1) {

                let p = {
                    x: xStep * x,
                    y: yStep * y,
                    z: zStep * z
                };

                positions.push(p.x);
                positions.push(p.y);
                positions.push(p.z);

                vertices.push(p);
            }
        }
    }

    //one segments consist of 2 vertices
    let segmentsIndices = [];
    for (let i = 0; i < vertices.length; i += 1) {
        let p = vertices[i];

        //only sides of grid
        if (options.wireframe &&
            p.z > 0 && p.z < depth &&
            p.x > 0 && p.x < width) {
            continue;
        }

        if (p.x < width) {

            if (options.wireframe) {

                if (p.z <= 0 || p.z >= depth) {
                    segmentsIndices.push(i);
                    segmentsIndices.push(getVertexIndex(p.x + xStep, p.y, p.z));
                }

            } else {
                segmentsIndices.push(i);
                segmentsIndices.push(getVertexIndex(p.x + xStep, p.y, p.z));
            }

        }

        if (p.y < height) {

            if (!options.cornerSides &&
                (p.x <= 0 || p.x >= width) &&
                (p.z <= 0 || p.z >= depth)) {
                //do nothing
            } else {
                segmentsIndices.push(i);
                segmentsIndices.push(getVertexIndex(p.x, p.y + yStep, p.z));
            }

        }

        if (p.z < depth) {

            if (options.wireframe) {

                if (p.x <= 0 || p.x >= width) {
                    segmentsIndices.push(i);
                    segmentsIndices.push(getVertexIndex(p.x, p.y, p.z + zStep));
                }

            } else {
                segmentsIndices.push(i);
                segmentsIndices.push(getVertexIndex(p.x, p.y, p.z + zStep));
            }

        }
    }

    let positionsAttribute = new THREE.Float32BufferAttribute(positions, 3);

    let geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', positionsAttribute);
    geometry.setIndex(segmentsIndices);

    let lines = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial());
    this.add(lines);

    //helpers

    function getVertexIndex(x, y, z) {
        //normalize
        x = x / xStep;
        y = y / yStep;
        z = z / zStep;

        return x + (y * xVertices) + (z * xVertices * yVertices);
    }
};
GridBox.prototype = Object.create(THREE.Group.prototype);
GridBox.prototype.constructor = GridBox;