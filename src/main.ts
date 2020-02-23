class InputState {
    public currMesh : BABYLON.AbstractMesh = null;
    public dragStartPos : BABYLON.Vector2 = null;
}

class GameStage {

    canvas: HTMLCanvasElement;
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    camera: BABYLON.TargetCamera;
    light: BABYLON.Light;

    //allMeshTable: { [id: number]: GameObject; } = {};
    meshTemplates:  { [id: number]: BABYLON.Mesh; } = {};

    private _inputState: InputState;

    private _boards: Board[] = [];


    constructor(public level: number, canvasElement: string) {
        // Create canvas and engine
        this.canvas = document.getElementById(canvasElement) as HTMLCanvasElement;
        this.engine = new BABYLON.Engine(this.canvas, true);
    }

    createScene(): void {
        // create a basic BJS Scene object
        this.scene = new BABYLON.Scene(this.engine);

        // create a FreeCamera, and set its position
        //this.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 20, 0), this.scene);
        this.camera = new BABYLON.ArcRotateCamera("Camera", Math.PI*3/2, 0, 20, BABYLON.Vector3.Zero(), this.scene);
        //console.log("Camera position: " + this.camera.position);

        // target the camera to scene origin
        //this.camera.setTarget(BABYLON.Vector3.Zero());

        // attach the camera to the canvas
        //this.camera.attachControl(this.canvas, false);
        this.camera.attachControl(this.canvas, true);

        // create a basic light, aiming 0,1,0 - meaning, to the sky
        this.light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 15, 0), this.scene);

        let DIMENSION = 5;
        this._boards.push(new Board(this));

        let boards = this._boards;
        this.scene.onBeforeRenderObservable.add(function () {
            for (let b of boards)
                b.update();
        });
        /*
        this.canvas.addEventListener("mousedown", () => {
            let pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
            if (pickResult.hit) {
                console.log(pickResult.faceId);
            }
        });
        */
        /*
        this.canvas.addEventListener("mousedown", () => {
            // We try to pick an object
            var pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);
            if (pickResult.hit && pickResult.pickedMesh != this._inputState.currMesh) {
                if (this._inputState.currMesh)
                    this._inputState.currMesh.material.alpha = 1;
                this._inputState.currMesh = pickResult.pickedMesh;
                if (this._inputState.currMesh) {
                    this._inputState.currMesh.material.alpha = 0.5;
                    this._inputState.dragStartPos.x = this.scene.pointerX;
                    this._inputState.dragStartPos.y = this.scene.pointerY;
                } else {
                    this._inputState.dragStartPos.x = -1; // no position
                }
            }
        });
        */
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
}

window.addEventListener('DOMContentLoaded', () => {
    // Create the game using the 'renderCanvas'
    let game = new GameStage(1, 'renderCanvas');

    // Create the scene
    game.createScene();

    // start animation
    game.animate();
});
