enum InputKey {
    UP = 0,
    DOWN,
    LEFT,
    RIGHT,
    FIRE,
    COUNT
}

class ShooterStage {

    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    camera: BABYLON.TargetCamera;
    spotLight: BABYLON.SpotLight;
    hemiLight: BABYLON.HemisphericLight;

    myShip: BABYLON.AbstractMesh;
    bullets: BABYLON.AbstractMesh[] = [];

    inputState: boolean[];
    lastUpateTs: number;
    lastVKeyTs: number = 0;
    lastHKeyTs: number = 0;
    lastFireKey: number = 0;

    constructor(canvasElement: string) {
        // Create canvas and engine
        this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);
        this.inputState = new Array<boolean>(InputKey.COUNT).fill(false);
    }
    
    createScene(): void {
        this.scene = new BABYLON.Scene(this.engine);

        this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 5, BABYLON.Vector3.Zero(), this.scene);
        // this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 4, -10), this.scene);
        // this.camera.rotation.x = Math.PI/16;
        //this.camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 20, BABYLON.Vector3.Zero(), this.scene);

        this.camera.attachControl(this.canvas, true);

        this.hemiLight = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 15, 0), this.scene);

        BABYLON.SceneLoader.ImportMesh("", "model/", "spaceship.babylon", this.scene,
            (meshes: BABYLON.AbstractMesh[], particleSystems: BABYLON.ParticleSystem[], skeletons: BABYLON.Skeleton[]): void => {
                this.myShip = meshes[0];
                let template = this.myShip as BABYLON.Mesh;
                //template.position.y = -1;
                var matrix = BABYLON.Matrix.Translation(0, -1, 0);
                template.bakeTransformIntoVertices(matrix);
                let instance = template.createInstance(template.name);
                this.myShip.rotation.y = Math.PI;
                instance.position.z = 50;
                this.bullets.push(this.createBullet());
                BABYLON.MeshBuilder.CreateSphere("origin", {diameter: 0.1}, this.scene);
                
            });
        this.scene.actionManager = new BABYLON.ActionManager(this.scene);
        let thisStage = this;
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            let currTs = Date.now();
            //console.log("Got key "+ evt.sourceEvent.key);
            switch (evt.sourceEvent.key) {
                case 'a':
                    thisStage.inputState[InputKey.LEFT] = true;
                    thisStage.inputState[InputKey.RIGHT] = false;
                    thisStage.lastHKeyTs = currTs;
                    break;
                case 'd':
                    thisStage.inputState[InputKey.LEFT] = false;
                    thisStage.inputState[InputKey.RIGHT] = true;
                    thisStage.lastHKeyTs = currTs;
                    break;
                case 'w':
                    thisStage.inputState[InputKey.UP] = true;
                    thisStage.inputState[InputKey.DOWN] = false;
                    thisStage.lastVKeyTs = currTs;
                    break;
                case 's':
                    thisStage.inputState[InputKey.UP] = false;
                    thisStage.inputState[InputKey.DOWN] = true;
                    thisStage.lastVKeyTs = currTs;
                    break;
                case ' ':
                    thisStage.inputState[InputKey.FIRE] = true;
                    thisStage.lastFireKey = currTs;
                    break;
                default:
                    break;
            }
        }));
        this.scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            let currTs = Date.now();
            switch (evt.sourceEvent.key) {
                case 'a':
                    thisStage.inputState[InputKey.LEFT] = false;
                    if (!thisStage.inputState[InputKey.RIGHT])
                        thisStage.lastHKeyTs = 0;
                    break;
                case 'd':
                    thisStage.inputState[InputKey.RIGHT] = false;
                    if (!thisStage.inputState[InputKey.LEFT])
                        thisStage.lastHKeyTs = 0;
                    break;
                case 'w':
                    thisStage.inputState[InputKey.UP] = true;
                    if (!thisStage.inputState[InputKey.DOWN])
                        thisStage.lastVKeyTs = 0;
                    break;
                case 's':
                    thisStage.inputState[InputKey.DOWN] = false;
                    if (!thisStage.inputState[InputKey.UP])
                        thisStage.lastVKeyTs = 0;
                    break;
                case ' ':
                    thisStage.inputState[InputKey.FIRE] = false;
                    thisStage.lastFireKey = 0;
                    break;
                default:
                    break;
            }
        }));

        this.scene.onBeforeRenderObservable.add( () => {
            thisStage.update();
        });

    }

    update() : void {
        // Update world
        let currTs = Date.now()
        let mvSpeed = 4; // per second
        let bltSpeed = 5;
        if (this.lastHKeyTs) {
            let deltaTime = currTs - this.lastHKeyTs;
            this.myShip.position.x += this.getVMove()*mvSpeed*deltaTime/1000;
            this.lastHKeyTs = currTs;
        }
        let deltaTime = currTs - this.lastUpateTs;
        // for (let b of this.bullets) {
        //     if (b.position.z < 20)
        //         b.position.z += bltSpeed * deltaTime/1000;
        // }

        this.lastUpateTs = currTs;
    }

    getVMove() : number {
        if (this.inputState[InputKey.LEFT])
            return -1;
        if (this.inputState[InputKey.RIGHT])
            return 1;
        return 0;
    }

    getHMove() : number {
        if (this.inputState[InputKey.DOWN])
            return -1;
        if (this.inputState[InputKey.UP])
            return 1;
        return 0;
    }

    createBullet() : BABYLON.AbstractMesh {
        let quad = BABYLON.MeshBuilder.CreatePlane("bullet", {size: 0.2, sideOrientation: BABYLON.Mesh.DOUBLESIDE, updatable: false}, this.scene);
        let mat = new BABYLON.StandardMaterial("matBullet", this.scene);
        let tx = new BABYLON.Texture("texture/flare_alpha.png", this.scene);
        tx.hasAlpha = true;
        mat.opacityTexture = tx;
        mat.opacityTexture.getAlphaFromRGB = true;
        mat.useSpecularOverAlpha = false;
        quad.material = mat;
        quad.position.x = this.myShip.position.x;
        quad.position.y = this.myShip.position.y;
        quad.position.z = this.myShip.position.z + 4;
        quad.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        return quad;
    }



    animate(): void {
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }

}

window.addEventListener('DOMContentLoaded', () => {
    let game = new ShooterStage('renderCanvas');
    game.createScene();
    this.lastUpateTs = Date.now()
    game.animate();
});
