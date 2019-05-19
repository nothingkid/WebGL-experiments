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

let GridBoxGeometry = function(width, height, depth, xSegments, ySegments, zSegments, options) {
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

    xSegments = Math.round(xSegments);
    ySegments = Math.round(ySegments);
    zSegments = Math.round(zSegments);

    let xVertices = xSegments + 1;
    let yVertices = ySegments + 1;
    let zVertices = zSegments + 1;

    //length of line
    let xStep = Math.round(width / xSegments * 100) / 100;
    let yStep = Math.round(height / ySegments * 100) / 100;
    let zStep = Math.round(depth / zSegments * 100) / 100;

    let positions = [];
    let vertices = [];
    for (let z = 0; z < zVertices; z += 1) {
        for (let y = 0; y < yVertices; y += 1) {
            for (let x = 0; x < xVertices; x += 1) {
                positions.push(xStep * x);
                positions.push(yStep * y);
                positions.push(zStep * z);

                vertices.push({
                    x: x,
                    y: y,
                    z: z
                })
            }
        }
    }

    //one segments consist of 2 vertices
    let segmentsIndices = [];
    for (let i = 0; i < vertices.length; i += 1) {
        let v = vertices[i];

        //only sides of grid
        if (options.wireframe &&
            v.z > 0 && v.z < zSegments &&
            v.x > 0 && v.x < xSegments) {
            continue;
        }

        if (v.x < xSegments) {

            if (options.wireframe) {

                if (v.z <= 0 || v.z >= zSegments) {
                    segmentsIndices.push(i);
                    segmentsIndices.push(getVertexIndex(v.x + 1, v.y, v.z));
                }

            } else {
                segmentsIndices.push(i);
                segmentsIndices.push(getVertexIndex(v.x + 1, v.y, v.z));
            }

        }

        if (v.y < ySegments) {

            if (!options.cornerSides &&
                (v.x <= 0 || v.x >= xSegments) &&
                (v.z <= 0 || v.z >= zSegments)) {
                //do nothing
            } else {
                segmentsIndices.push(i);
                segmentsIndices.push(getVertexIndex(v.x, v.y + 1, v.z));
            }

        }

        if (v.z < zSegments) {

            if (options.wireframe) {

                if (v.x <= 0 || v.x >= xSegments) {
                    segmentsIndices.push(i);
                    segmentsIndices.push(getVertexIndex(v.x, v.y, v.z + 1));
                }

            } else {
                segmentsIndices.push(i);
                segmentsIndices.push(getVertexIndex(v.x, v.y, v.z + 1));
            }

        }
    }

    let positionsAttribute = new THREE.Float32BufferAttribute(positions, 3);

    let geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', positionsAttribute);
    geometry.setIndex(segmentsIndices);

    geometry.translate(
        -width / 2,
        -height /2,
        -depth / 2
    );

    return geometry;

    // let lines = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial());
    // this.add(lines);

    //helpers

    function getVertexIndex(x, y, z) {
        return x + (y * xVertices) + (z * xVertices * yVertices);
    }
};
GridBoxGeometry.prototype = Object.create(THREE.Group.prototype);
GridBoxGeometry.prototype.constructor = GridBoxGeometry;