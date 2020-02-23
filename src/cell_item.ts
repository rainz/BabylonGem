class CellItem extends GameObj {
    board: Board;
    row: number;
    col: number;
    rgbColor : RGBColor;
    protected constructor(board: Board) {
        super(board.stage);
        this.board = board;
        this.rgbColor = RGBColor.NONE;
    }
}

class Gem extends CellItem {
    // Order MUST match RGBColor enum!!
    private static _meshMapping : MeshType[] = [ null,
        MeshType.GEM_B, MeshType.GEM_G, MeshType.GEM_GB, MeshType.GEM_R,
        MeshType.GEM_RB, MeshType.GEM_RG, MeshType.GEM_RGB
    ];

    protected _energyParticles : BABYLON.ParticleSystem = null;
    protected _debrisParticles : BABYLON.ParticleSystem = null;

    private _meshIds : MeshType[] = [];

    constructor(board: Board, color: string) {
        super(board);
        this.hitPoints = 1;
        this.rgbColor = Util.rgbColorFromeString(color);
        if (this.rgbColor == RGBColor.NONE) {
            // Randomly pick one from R, G, and B
            let idx = Math.floor(Math.random()*3);
            if (idx == 0)
                this.rgbColor = RGBColor.R;
            else if (idx == 1)
                this.rgbColor = RGBColor.G;
            else
                this.rgbColor = RGBColor.B;
        }
        let meshType: MeshType = Gem._meshMapping[this.rgbColor];
        this._meshIds.push(meshType);
    }
    
    getMeshIds() : MeshType[] {
        return this._meshIds;
    }

    startDispose() : void {
        super.startDispose();
        let eps = this.createEnergyParticles();
        eps.start();
        let dps = this.createDebrisParticles();
        dps.start();
    }

    createEnergyParticles() : BABYLON.ParticleSystem {
        if (this._energyParticles)
            return this._energyParticles;

        let scene = this.stage.scene;
        let mesh = this.meshes[0];
        let color3 = Util.color3FromRgb(this.rgbColor);

        let particleCount = 100;
        let ps = new BABYLON.ParticleSystem("particles", particleCount, scene);
        this._energyParticles = ps;

        //Texture of each particle
        ps.particleTexture = new BABYLON.Texture("texture/flare.png", scene);

        // Where the particles come from
        ps.emitter = mesh; // the starting object, the emitter
        ps.minEmitBox = new BABYLON.Vector3(-0.1, 0, 0); // Starting all from
        ps.maxEmitBox = new BABYLON.Vector3(0.1, 0, 0); // To...

        // Direction of each particle after it has been emitted
        ps.direction1 = new BABYLON.Vector3(-0.5, 6, 0.5);
        ps.direction2 = new BABYLON.Vector3(0.5, 6, -0.5);

        // Angular speed, in radians
        ps.minAngularSpeed = 0;
        ps.maxAngularSpeed = Math.PI;

        // Colors of all particles
        // ps.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
        // ps.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
        //ps.colorDead = new BABYLON.Color4(0, 0, 0.2, 0.0);
        ps.color1 = new BABYLON.Color4(color3.r, color3.g, color3.b, 1.0);
        ps.color2 = new BABYLON.Color4(1, 1, 1, 1.0);
        ps.colorDead = new BABYLON.Color4(0, 0, 0.0, 0.0);

        // Size of each particle (random between...
        ps.minSize = 0.5;
        ps.maxSize = 1.0;

        // Life time of each particle (random between...
        ps.minLifeTime = 0.3;
        ps.maxLifeTime = 0.5;

        // Speed
        ps.minEmitPower = 1;
        ps.maxEmitPower = 2;
        ps.updateSpeed = 0.02;

        ps.manualEmitCount = particleCount;

        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        // Set the gravity of all particles
        ps.gravity = new BABYLON.Vector3(0, -9.81, 0);
        
        ps.targetStopDuration = 2;
        ps.disposeOnStop = true;

        let objThis = this;
        ps.onDisposeObservable.add(function () {
            for (let m of objThis.meshes) {
                Util.removeFromSight(m);
                m.dispose();
            }
        });
        
        return ps;
    }

    createDebrisParticles() : BABYLON.ParticleSystem {
        if (this._debrisParticles)
            return this._debrisParticles;

        let scene = this.stage.scene;
        let mesh = this.meshes[0];
        let color3 = Util.color3FromRgb(this.rgbColor);

        let particleCount = 20;
        let ps = new BABYLON.ParticleSystem("particles", particleCount, scene);
        this._debrisParticles = ps;

        //Texture of each particle
        ps.particleTexture = new BABYLON.Texture("texture/triangle.png", scene);

        // Where the particles come from
        ps.emitter = mesh; // the starting object, the emitter
        ps.minEmitBox = new BABYLON.Vector3(-0.5, 0, 0); // Starting all from
        ps.maxEmitBox = new BABYLON.Vector3(0.5, 0, 0); // To...

        // Direction of each particle after it has been emitted
        ps.direction1 = new BABYLON.Vector3(-1.5, 3, 1.5);
        ps.direction2 = new BABYLON.Vector3(1.5, 3, -1.5);

        // Angular speed, in radians
        ps.minAngularSpeed = 0;
        ps.maxAngularSpeed = Math.PI;

        // Colors of all particles
        ps.color1 = new BABYLON.Color4(color3.r, color3.g, color3.b, 1.0);
        ps.color2 = new BABYLON.Color4(color3.r/2.0, color3.g/2.0, color3.b/2.0, 1.0);
        ps.colorDead = new BABYLON.Color4(0, 0, 0.0, 0.0);

        // Size of each particle (random between...
        ps.minSize = 0.2;
        ps.maxSize = 0.7;

        // Life time of each particle (random between...
        ps.minLifeTime = 0.5;
        ps.maxLifeTime = 1;

        // Speed
        ps.minEmitPower = 1;
        ps.maxEmitPower = 2;
        ps.updateSpeed = 0.02;

        ps.manualEmitCount = particleCount;

        // Blend mode : BLENDMODE_ONEONE, or BLENDMODE_STANDARD
        ps.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        // Set the gravity of all particles
        ps.gravity = new BABYLON.Vector3(0, -9.81, 0);
        
        ps.targetStopDuration = 1;
        ps.disposeOnStop = true;
        
        return ps;
    }
}

class Mirror extends CellItem {
    shouldRotate: boolean;
    rotationSpeed = Math.PI/8; // per second

    private static _meshIds = [MeshType.MIRROR];

    constructor(board: Board) {
        super(board);
        this.shouldRotate = false;
        this.opacityType = OpacityType.REFLECT;
    }

    afterCreate() : void {
        let mesh = this.meshes[0];
        let scene = this.stage.scene;
        mesh.actionManager = new BABYLON.ActionManager(scene);
        mesh.actionManager.registerAction(new BABYLON.SwitchBooleanAction(BABYLON.ActionManager.OnPickTrigger, this, "shouldRotate"));
    }
    
    getMeshIds() : MeshType[] {
        return Mirror._meshIds;
    }
}

class BeamSource extends CellItem {
    powerSwitch : boolean;

    private _direction : Direction;
    private _colors : RGBColor[] = [
        RGBColor.R, RGBColor.G, RGBColor.B
    ];
    private _colorIdx : number;

    private _rayLines : BABYLON.AbstractMesh;

    private static MAX_RAY_LEN = 100;
    private static MAX_RAY_HITS = 10;
    private static _meshIds = [MeshType.BEAM_SOURCE];

    constructor(board: Board) {
        super(board);
        this._colorIdx = 1;
        this._direction = Direction.RIGHT;
        this.opacityType = OpacityType.BLOCK;
    }

    getMeshIds() : MeshType[] {
        return BeamSource._meshIds;
    }

    setDirection(dir: Direction) : void {
        this._direction = dir;
        let angle = 0;
        switch(dir) {
            case Direction.RIGHT:
                angle = 0;
                break;
            case Direction.DOWN:
                angle = Math.PI/2;
                break;
            case Direction.LEFT:
                angle = Math.PI;
                break;
            case Direction.UP:
                angle = Math.PI*3/2;
                break;
            default:
                console.log("Internal error: unknown direction");
                return;
        }
        this.meshes[0].rotation.y = angle;
    }

    getDirection() : Direction {
        return this._direction;
    }

    getRGBColor() : number {
        return this._colors[this._colorIdx];
    }

    setNextColor() : void {
        this._colorIdx = (this._colorIdx + 1) % this._colors.length;
        // TODO update mesh AND ray
    }

    // Returns a list of items hit by rays. Note: an item could appear twice!!
    // The reason for returning an array (rather than a set) is to retain the order in which items were hit.
    emitRay() : CellItem[] {
        /*if (!this.powerSwitch)
            return;*/
        let scene = this.board.stage.scene;
        let rayPoints: BABYLON.Vector3[] = [];
        rayPoints.push(this.meshes[0].position);
        let rayDir = Util.getDirectionVector(this.getDirection());
        let mirrorHits = 0;
        let lastBlock: BABYLON.AbstractMesh = null;
        let hitItems: CellItem[] = [];
        while (mirrorHits < BeamSource.MAX_RAY_HITS && rayDir) {
            let origin = rayPoints[rayPoints.length-1];
            let direction = BABYLON.Vector3.Normalize(rayDir);
            let ray = new BABYLON.Ray(origin, direction, BeamSource.MAX_RAY_LEN);
            let hitInfoArray = scene.multiPickWithRay(ray, null);

            // Find first hit
            let blockHitInfo: BABYLON.PickingInfo = null;
            for (let hitInfo of hitInfoArray) {
                if (!hitInfo.hit)
                    break;
                if (Util.isBlocking(hitInfo.pickedMesh) && hitInfo.pickedMesh != lastBlock) {
                    if (!blockHitInfo || blockHitInfo.distance < hitInfo.distance)
                        blockHitInfo = hitInfo;
                }
            }
            let endPoint: BABYLON.Vector3 = null;
            if (blockHitInfo) {
                endPoint = blockHitInfo.pickedPoint;
                // Add the blocking object to result
                hitItems.push(Util.ObjForMesh(blockHitInfo.pickedMesh) as CellItem);
            } else {
                // Draw the final ray which leaves the board
                endPoint = origin.add(direction.scale(BeamSource.MAX_RAY_LEN));
            }
            rayPoints.push(endPoint);

            // Find all items hit by ray before the blocking obj
            for (let hitInfo of hitInfoArray) {
                let mHit = hitInfo.pickedMesh;
                let item = Util.ObjForMesh(mHit) as CellItem;
                if (item && item.opacityType != OpacityType.BLOCK
                    && (!blockHitInfo || hitInfo.distance < blockHitInfo.distance))
                {
                    hitItems.push(item);
                }
            }

            // Do reflection if necessary
            rayDir = null;
            if (blockHitInfo && Util.isReflective(blockHitInfo.pickedMesh)) {
                ++mirrorHits;
                let hitMesh = blockHitInfo.pickedMesh;
                lastBlock = hitMesh;
                hitMesh.updateFacetData(); // TODO: move this
                let hitFace = blockHitInfo.faceId;
                // 0 1 2 3 are reflective facets, two facets per face
                //console.log("Mesh " + hitMesh.uniqueId+", hitFace="+hitFace);
                if (hitFace <= 3) {
                    let norm = hitMesh.getFacetNormal(hitFace);
                    let inBeam = endPoint.subtract(origin);
                    // r=d−2(d.n)n
                    rayDir = inBeam.subtract(norm.scale(2*BABYLON.Vector3.Dot(inBeam, norm)));
                }
            }
        }

        // Draw all rays
        // TODO consider updating lines instead of creating new lines
        if (this._rayLines) {
            this._rayLines.dispose();
        } 
        this._rayLines = BABYLON.MeshBuilder.CreateLines("rays", {points: rayPoints, updatable: true}, scene);
        //this._rayLines = BABYLON.MeshBuilder.CreateDashedLines("rays", {points: rayPoints, dashSize: 1, gapSize: 1}, scene);
        (this._rayLines as BABYLON.LinesMesh).color = Util.color3FromRgb(this._colors[this._colorIdx]);
        this._rayLines.isPickable = false;

        return hitItems;
        // https://www.babylonjs-playground.com/#UUVVMF
    }

    emitLine() : void {
        let scene = this.board.stage.scene;
        let rayPoints: BABYLON.Vector3[] = [];
        rayPoints.push(this.meshes[0].position);
        let rayDir = Util.getDirectionVector(this.getDirection());
        let mirrorHits = 0;
        let lastMirror: BABYLON.AbstractMesh = null;
        while (mirrorHits < BeamSource.MAX_RAY_HITS) {
            let origin = rayPoints[rayPoints.length-1];
            let direction = BABYLON.Vector3.Normalize(rayDir);
            let ray = new BABYLON.Ray(origin, direction, BeamSource.MAX_RAY_LEN);
            let hitInfo = scene.pickWithRay(ray, (mesh: BABYLON.Mesh): boolean => {
                return Util.isReflective(mesh) && mesh !== lastMirror});
            if (!hitInfo.hit) {
                // Draw the final ray which leaves the board
                rayPoints.push(origin.add(direction.scale(BeamSource.MAX_RAY_LEN)));
                break;
            }
            ++mirrorHits;
            let endPoint = hitInfo.pickedPoint;
            rayPoints.push(endPoint);
            let hitMesh = hitInfo.pickedMesh;
            lastMirror = hitMesh;
            hitMesh.updateFacetData(); // TODO: move this
            let hitFace = hitInfo.faceId;
            // 0 1 2 3 are reflective facets, two facets per face
            //console.log("Mesh " + hitMesh.uniqueId+", hitFace="+hitFace);
            if (hitFace > 3)
                break;
            let norm = hitMesh.getFacetNormal(hitFace);
            let inBeam = endPoint.subtract(origin);
            // r=d−2(d.n)n
            rayDir = inBeam.subtract(norm.scale(2*BABYLON.Vector3.Dot(inBeam, norm)));
        }

        if (this._rayLines)
            this._rayLines.dispose();

        this._rayLines = BABYLON.MeshBuilder.CreateLines("rays", {points: rayPoints}, scene);
    }
}
