class TestStage {

    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    camera: BABYLON.TargetCamera;
    spotLight: BABYLON.SpotLight;
    hemiLight: BABYLON.HemisphericLight;

    constructor(canvasElement: string) {
        // Create canvas and engine
        this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);
    }

    createScene(): void {
        // create a basic BJS Scene object
        this.scene = new BABYLON.Scene(this.engine);

        // create a FreeCamera, and set its position
        //this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 20, 0), this.scene);
        this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 5, BABYLON.Vector3.Zero(), this.scene);
        //console.log("Camera position: " + this.camera.position);

        // target the camera to scene origin
        //this.camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        //this.camera.attachControl(this.canvas, false);
        this.camera.attachControl(this.canvas, true);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this.hemiLight = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 15, 0), this.scene);
        this.hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);
        this.hemiLight.specular = new BABYLON.Color3(1, 1, 1);
        this.hemiLight.groundColor = new BABYLON.Color3(0, 0, 0);
        this.spotLight = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(10, 10, 10), new BABYLON.Vector3(0, 0, 0), Math.PI/4, 2, this.scene);
        this.spotLight.diffuse = new BABYLON.Color3(1, 1, 1);
        this.spotLight.specular = new BABYLON.Color3(1, 1, 1);

        let crystalColor = new BABYLON.Color3(0, 0, 0.4)
        let crystal = this.createCrystalBlock(2, 0.4);
        let shaderMaterial = new BABYLON.ShaderMaterial("shader", this.scene, "./crystal",
            {
                attributes: ["position", "normal", "uv"],
                uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
            });
        shaderMaterial.setColor3("base_color", crystalColor);
        let mainTexture = new BABYLON.Texture("texture/crystal.png", this.scene);
        shaderMaterial.setTexture("textureSampler", mainTexture);
        shaderMaterial.setVector3("light_position", this.spotLight.getAbsolutePosition());
        shaderMaterial.setVector3("eye_position", this.camera.position);
        shaderMaterial.setFloat("material_shininess", 0.5);
        shaderMaterial.setFloat("material_kd", 0.5);
        shaderMaterial.setFloat("material_ks", 0.5);
        shaderMaterial.backFaceCulling = false;
        crystal.material = shaderMaterial;
        let mat = new BABYLON.StandardMaterial("crystalMat", this.scene);
        let tx = new BABYLON.Texture("texture/crystal.png", this.scene);
        mat.diffuseTexture = tx;
        //crystal.material = mat;
    
        /*this.scene.onBeforeRenderObservable.add(function () {
        });*/
        /*
        this.canvas.addEventListener("mousedown", () => {
            let pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
            if (pickResult.hit) {
                console.log(pickResult.faceId);
            }
        });
        */

        //this.scene.debugLayer.show();
    }

    
    createModelScene(): void {
        // create a basic BJS Scene object
        this.scene = new BABYLON.Scene(this.engine);

        // create a FreeCamera, and set its position
        //this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 20, 0), this.scene);
        this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 20, BABYLON.Vector3.Zero(), this.scene);
        //console.log("Camera position: " + this.camera.position);

        // target the camera to scene origin
        //this.camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        //this.camera.attachControl(this.canvas, false);
        this.camera.attachControl(this.canvas, true);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this.hemiLight = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 15, 0), this.scene);
        // this.hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);
        // this.hemiLight.specular = new BABYLON.Color3(1, 1, 1);
        // this.hemiLight.groundColor = new BABYLON.Color3(0, 0, 0);
        // this.spotLight = new BABYLON.SpotLight("Spot0", new BABYLON.Vector3(10, 10, 10), new BABYLON.Vector3(0, 0, 0), Math.PI/4, 2, this.scene);
        // this.spotLight.diffuse = new BABYLON.Color3(1, 1, 1);
        // this.spotLight.specular = new BABYLON.Color3(1, 1, 1);

        let model: BABYLON.AbstractMesh = null;
        BABYLON.SceneLoader.ImportMesh("", "model/", "spaceship.babylon", this.scene,
            (meshes: BABYLON.AbstractMesh[], particleSystems: BABYLON.ParticleSystem[], skeletons: BABYLON.Skeleton[]): void => { 
                console.log("loaded meshes count: " + meshes.length);
            });
    }

    animate(): void {
        // run the render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        // the canvas/window resize event handler
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

    
    private createCrystalBlock(ht: number, diameter: number) {
        let tess = 5;
        let cylHt = ht*0.85;
        let cyl = BABYLON.MeshBuilder.CreateCylinder("cyl", {height: cylHt, diameter: diameter, tessellation: tess}, this.scene);
        let cone = BABYLON.MeshBuilder.CreateCylinder("cone", {height: ht-cylHt, diameterTop: 0, diameterBottom: diameter, tessellation: tess}, this.scene);
        cone.position.y += ht/2.0;
        let block = BABYLON.Mesh.MergeMeshes([cyl, cone]);
        return block;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Create the game using the 'renderCanvas'
    let game = new TestStage('renderCanvas');

    // Create the scene
    //game.createScene();
    game.createModelScene();

    // start animation
    game.animate();
});
