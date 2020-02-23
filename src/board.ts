class Board {
    row_count: number;
    col_count: number;
    grid: CellItem[][];
    stage: GameStage;

    beamSrcs: BeamSource[];
    mirrors: Mirror[];

    private static MAX_RAY_LEN = 100;
    private static MAX_RAY_HITS = 20;
    private _cellSize = 2; // make this number even so grid coordinates are integers
    private _boardY = 1;

    private _lastUpdateTime = 0;

    constructor(stage: GameStage) {
        this.grid = [];
        this.beamSrcs = [];
        this.mirrors = [];
        this.stage = stage;
        let stageData = allLevels[stage.level-1];
        this.row_count = stageData.rows;
        this.col_count = stageData.cols;
        let scene = this.stage.scene;
        for (let r = 0; r < this.row_count; ++r) {
            let row: CellItem[] = [];
            for (let c = 0; c < this.col_count; ++c) {
                let item = GameObj.createInstance(stageData.cells[r][c], this.stage.scene, this) as CellItem;
                this.setItemPosition(item, r, c);
                row.push(item);
            }
            this.grid.push(row);
        }
        
        //Meshes.createGround(scene, 16, this._cellSize);
        // create a built-in "ground" shape
        let ground = BABYLON.MeshBuilder.CreateGround('ground1',
            { width: 12, height: 12, subdivisions: 2 }, scene);
        let matGround = new BABYLON.StandardMaterial("groundMat", scene);
        matGround.diffuseColor = BABYLON.Color3.Purple();
        ground.material = matGround;

Meshes.createCrystalMesh(this.stage.scene);
        for (let i = 0; i < stageData.beamCount; ++i) {
            let beamRow = 0;
            let beamCol = -1;
            let beamDir = Direction.RIGHT;
            let beamSource = GameObj.createInstance(GameObjType.BEAM_SOURCE, this.stage.scene, this) as BeamSource;
            if (i < this.row_count) {
                beamRow = i;
                beamCol = -1;
                beamDir = Direction.RIGHT;
            } else if (i < this.row_count + this.col_count) {
                beamRow = this.row_count;
                beamCol = i - this.row_count;
                beamDir = Direction.UP;
            } else if (i < 2*this.row_count + this.col_count) {
                beamRow = this.row_count - 1 - (i - this.row_count - this.col_count);
                beamCol = this.col_count;
                beamDir = Direction.LEFT;
            } else if (i < 2*this.row_count + 2*this.col_count) {
                beamRow = -1;
                beamCol = this.col_count - 1 - (i - 2*this.row_count - this.col_count);
                beamDir = Direction.DOWN;
            } else {
                break;
            }
            beamSource.setDirection(beamDir);
            this.setItemPosition(beamSource, beamRow, beamCol);
            beamSource.powerSwitch = true;
        }
        
    }

    setItemPosition(item: CellItem, row: number, col: number) : void {
        let width = this._cellSize * this.col_count;
        let height = this._cellSize * this.row_count;
        let leftX = -width/2 + this._cellSize/2;
        let topZ  = height/2 - this._cellSize/2;
        item.setPosition(leftX + col*this._cellSize, this._boardY, topZ - row*this._cellSize);
        item.row = row;
        item.col = col;
    }

    update() : void {
        let currTime = Date.now()
        if (this._lastUpdateTime > 0) {
            let delta = currTime - this._lastUpdateTime;
            for (let m of this.mirrors) {
                if (m.shouldRotate) {
                    let rot = m.meshes[0].rotation;
                    rot.y += m.rotationSpeed * delta / 1000;
                    if (rot.y >= 2*Math.PI)
                        rot.y -= 2*Math.PI;
                }
            }
        }
        this._lastUpdateTime = currTime;
        for (let src of this.beamSrcs) {
            let hitObjs = src.emitRay();
            let emptyCells = [];
            let srcColor = src.getRGBColor();
            for (let obj of hitObjs) {
                if (obj.rgbColor != srcColor)
                    continue;
                if (!obj.isDestructable())
                    continue;
                let r = obj.row;
                let c = obj.col;
                if (this.grid[r][c] != null) {
                    emptyCells.push([r, c]);
                    this.grid[r][c] = null;
                    obj.startDispose();
                }             
            }
        }
    }

}