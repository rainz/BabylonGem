enum MeshType {
    GEM_R = 2,
    GEM_G = 3,
    GEM_B = 4,
    GEM_RG = 5,
    GEM_RB = 6,
    GEM_GB = 7,
    GEM_RGB = 8,
    CRYSTAL = 30,
    MIRROR = 100,
    BEAM_SOURCE = 200,
}

class Meshes {

    private static createGemMesh(scene: BABYLON.Scene, color: BABYLON.Color3, polyType: number) : BABYLON.Mesh {
        let mesh = BABYLON.MeshBuilder.CreatePolyhedron("gem", {type: polyType, size: 0.4}, scene);
        let material = new BABYLON.StandardMaterial("gemMat", scene);
        //material.emissiveColor = color;
        //material.ambientColor = color;
        material.diffuseColor = color;
        material.specularColor = color;
        material.alpha = 0.7;
        mesh.material = material;
        return mesh;
    }

    private static createCrystalBlock(color: BABYLON.Color3, ht: number, diameter: number, scene: BABYLON.Scene) {
        let tess = 5;
        let cylHt = ht*0.85;
        let cyl = BABYLON.MeshBuilder.CreateCylinder("cyl", {height: cylHt, diameter: diameter, tessellation: tess}, scene);
        let cone = BABYLON.MeshBuilder.CreateCylinder("cone", {height: ht-cylHt, diameterTop: 0, diameterBottom: diameter, tessellation: tess}, scene);
        cone.position.y += ht/2.0;
        let block = BABYLON.Mesh.MergeMeshes([cyl, cone]);
        let mat = new BABYLON.StandardMaterial("matCrystal", scene);
        //let tx = new BABYLON.Texture("texture/marble.png", scene);
        let tx = new BABYLON.MarbleProceduralTexture("marble", 512, scene);
        // tx.hasAlpha = true;
        mat.diffuseTexture = tx;
        // mat.opacityTexture = tx;
        // mat.alpha = 0.4;
        // mat.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
        //mat.alphaMode = BABYLON.Engine.ALPHA_ONEONE;
        //mat.backFaceCulling = false;
        // mat.diffuseColor = color;
        //mat.emissiveColor = color;
        mat.ambientColor = color;
        block.material = mat; 

        return block;
    }

    static createCrystalMesh(scene: BABYLON.Scene) : BABYLON.Mesh {
        let crystal1 = this.createCrystalBlock(new BABYLON.Color3(0, 0, 0.4), 2, 0.4, scene);
        return crystal1;
        //crystal1.rotation.x = -Math.PI/8;
        //crystal1.rotation.z = -Math.PI/4;

        // let crystal2 = this.createCrystalBlock(BABYLON.Color3.Blue(), 2, 0.2, scene);
        // crystal2.rotation.x = -Math.PI/4;
        // crystal2.rotation.z = -Math.PI/8;

        // return BABYLON.Mesh.MergeMeshes([crystal1, crystal2]);
    }


    static createMesh(meshType: MeshType, scene: BABYLON.Scene, obj: GameObj) : BABYLON.Mesh {
        let mesh: BABYLON.Mesh = null;
        switch(meshType) {
            case MeshType.BEAM_SOURCE:
                mesh = BABYLON.Mesh.CreateCylinder("src", 1, 0.3, 0.3, 6, 1, scene, false);
                let srcMat = new BABYLON.StandardMaterial("srcMat", scene);
                srcMat.emissiveColor = BABYLON.Color3.Blue();
                mesh.material = srcMat; 
                mesh.rotation.z = Math.PI/2;
                let src = obj as BeamSource;
                mesh.rotation.y = Util.angleForDirection(src.getDirection());
                break;
            case MeshType.GEM_R:
                mesh = this.createGemMesh(scene, BABYLON.Color3.Red(), 12);
                break;
            case MeshType.GEM_G:
                mesh = this.createGemMesh(scene, BABYLON.Color3.Green(), 10);
                break;
            case MeshType.GEM_B:
                mesh = this.createGemMesh(scene, BABYLON.Color3.Blue(), 10);
                break;
            case MeshType.GEM_RG:
                mesh = this.createGemMesh(scene, new BABYLON.Color3(0.3, 1, 1), 10); // TODO
                break;
            case MeshType.GEM_RB:
                mesh = this.createGemMesh(scene, new BABYLON.Color3(0.3, 1, 1), 10); // TODO
                break;
            case MeshType.GEM_GB:
                mesh = this.createGemMesh(scene, new BABYLON.Color3(0.3, 1, 1), 10); // TODO
                break;
            case MeshType.GEM_RGB:
                mesh = this.createGemMesh(scene, BABYLON.Color3.White(), 10); // TODO
                break;
            case MeshType.MIRROR:
                mesh = BABYLON.MeshBuilder.CreateBox("mirror", {width: 1, height: 1, depth: 0.05}, scene);
                mesh.rotation.x = 0;
                mesh.rotation.y = Math.PI/4;
                mesh.rotation.z = 0;
                break;
            case MeshType.CRYSTAL:
                mesh = Meshes.createCrystalMesh(scene);
                break;
            default:
                console.log("Internal error: unknown mesh type " + meshType);
                break;
        }
        return mesh;
    }

    private static getVal(arr: number[][], r: number, c: number) {
        let maxIdx = arr.length - 1;
        if (r < 0)
            r = 0;
        else if (r > maxIdx)
            r = maxIdx;
        if (c < 0)
            c = 0;
        else if (c > maxIdx)
            c = maxIdx;
        return arr[r][c];
    }

    private static diamond_square(hMap: number[][], hMin: number, hMax: number) : void {
        let scale = hMax - hMin;
        let gridSize = hMap.length;
        let size = gridSize - 1;

        // Set 4 corners
        hMap[0][0] = hMin + Math.random() *scale;
        hMap[0][gridSize-1] = hMin + Math.random() *scale;
        hMap[gridSize-1][0] = hMin + Math.random() *scale;
        hMap[gridSize-1][gridSize-1] = hMin + Math.random() *scale;

        while (size > 1) {
            let half = size / 2;
            // Square
            for (let r = half; r < gridSize; r += size) {
                for (let c = half; c < gridSize; c += size) {
                    let h = (hMap[r-half][c-half] + hMap[r-half][c+half]
                             + hMap[r+half][c-half] + hMap[r+half][c+half])/4
                             - scale + Math.random()*scale*2;
                    if (h < hMin)
                        h = hMin;
                    if (h > hMax)
                        h = hMax;
                    hMap[r][c] = h;
                    console.log("square: r="+r+",c="+c+",val="+h);
                }
            }
            // Diamond
            for (let c = 0; c < gridSize; c += half) {
                for (let r = (c + half) % size; r < gridSize; r += size) {
                    let h = (Meshes.getVal(hMap, r-half, c)
                             + Meshes.getVal(hMap, r+half, c) 
                             + Meshes.getVal(hMap, r, c-half)
                             + Meshes.getVal(hMap, r, c-half))/4
                             - scale + Math.random()*scale*2;
                    if (h < hMin)
                        h = hMin;
                    if (h > hMax)
                        h = hMax;
                    hMap[r][c] = h;
                    console.log("diamond: r="+r+",c="+c+",val="+h);
                //diamond(x, y, half, Math.random() * scale * 2 - scale);
                }
            }
            size = half;
        }
    }

    static createGround(scene: BABYLON.Scene, division: number, cellSize: number) : BABYLON.Mesh {
        // TODO ensure division is power of 2
        let vertDim = division + 1;
        let heightMap: number[][] = []
        for (let r = 0; r < vertDim; ++r) {
            let row: number[] = [];
            for (let c = 0; c < vertDim; ++c) {
                row.push(0);
            }
            heightMap.push(row);
        }
        Meshes.diamond_square(heightMap, -0.5, 0.5);

        let vertices: number[] = [];
        let normals: number[] = [];
        let uvs: number[] = [];
        let half = division/2;
        // Vertices
        for (let r = half; r >= -half; --r) {
            for (let c = -half; c <= half; ++c) {
                let r0 = r + half;
                let c0 = c + half;
                vertices.push(c*cellSize);
                vertices.push(heightMap[r0][c0]);
                vertices.push(r*cellSize);
                normals.push(0);
                normals.push(1);
                normals.push(0);
                // TODO
                uvs.push(c0/division);
                uvs.push(r0/division); 
            }
        }

        // Faces
        let indices: number[] = [];
        for (let r = 0; r < division; ++r) {
            for (let c = 0; c < division; ++c) {
                let ul = r*vertDim + c;
                let ur = ul + 1;
                let ll = ul + vertDim;
                let lr = ll + 1;
                // Triangle 1
                indices.push(ul);
                indices.push(ll);
                indices.push(lr);
                // Triangle 2
                indices.push(ul);
                indices.push(lr);
                indices.push(ur);
            }
        }

        let ground = new BABYLON.Mesh("ground", scene);
        var vertexData = new BABYLON.VertexData();
        vertexData.positions = vertices;
        vertexData.indices = indices;
        normals = [];
        BABYLON.VertexData.ComputeNormals(vertices, indices, normals);
        vertexData.normals = normals;
        vertexData.uvs = uvs;
        vertexData.applyToMesh(ground);
        let mat = new BABYLON.StandardMaterial("groundMat", scene);
        let tx = new BABYLON.Texture("texture/ground.png", scene);
        mat.diffuseTexture = tx;
        //mat.diffuseColor = BABYLON.Color3.Purple();
        ground.material = mat;
        return ground;
    }
}