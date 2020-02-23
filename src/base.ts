enum GameObjType {
    GEM_ANY = 1, // R, G, or B
    GEM_R = 2,
    GEM_G = 3,
    GEM_B = 4,
    GEM_RG = 5,
    GEM_RB = 6,
    GEM_GB = 7,
    GEM_RGB = 8,
    MIRROR = 100,
    BEAM_SOURCE = 200,
}

enum Direction {
    RIGHT = 0,
    DOWN,
    LEFT,
    UP
}

enum RGBColor {
    NONE = 0, // 000
    B    = 1, // 001
    G    = 2, // 010
    GB   = 3, // 011
    R    = 4, // 100
    RB   = 5, // 101
    RG   = 6, // 110
    RGB  = 7, // 111
}

class Util {
    static RIGHT_VEC = new BABYLON.Vector3(1, 0, 0);
    static DOWN_VEC  = new BABYLON.Vector3(0, 0, -1);
    static LEFT_VEC  = new BABYLON.Vector3(-1, 0, 0);
    static UP_VEC    = new BABYLON.Vector3(0, 0, 1);

    static rgbColorMap : BABYLON.Color3[] = [
        new BABYLON.Color3(0, 0, 0), new BABYLON.Color3(0, 0, 1),
        new BABYLON.Color3(0, 1, 0), new BABYLON.Color3(0, 1, 1),
        new BABYLON.Color3(1, 0, 0), new BABYLON.Color3(1, 0, 1),
        new BABYLON.Color3(1, 1, 0), new BABYLON.Color3(1, 1, 1),
    ];

    static getDirectionVector(dir: Direction) : BABYLON.Vector3 {
        switch(dir) {
            case Direction.RIGHT:
                return this.RIGHT_VEC;
            case Direction.DOWN:
                return this.DOWN_VEC;
            case Direction.LEFT:
                return this.LEFT_VEC;
            case Direction.UP:
            default:
                return this.UP_VEC;
        }
    }

    static angleForDirection(dir: Direction) : number {
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
                break;
        }
        return angle;
    }
    
    static ObjForMesh(mesh: BABYLON.AbstractMesh) : GameObj {
        return mesh["objRef"];
    }

    static isBlocking(mesh: BABYLON.AbstractMesh) : boolean {
        let obj = Util.ObjForMesh(mesh);
        return obj ? (obj.opacityType != OpacityType.TRANSPARENT) : false;
    }

    static isReflective(mesh: BABYLON.AbstractMesh) : boolean {
        let obj = Util.ObjForMesh(mesh);
        return obj ? (obj.opacityType == OpacityType.REFLECT) : false;
    }

    static rgbColorFromeString(str: string) : number {
        let result = 0;
        for (let c of str) {
            switch (c) {
                case 'r': result |= RGBColor.R; break;
                case 'g': result |= RGBColor.G; break;
                case 'b': result |= RGBColor.B; break;
                default:
                    console.log("Invalid color string " + str);
                    break;
            }
        }
        return result;
    }

    static color3FromRgb(rgb: number) : BABYLON.Color3 {
        return Util.rgbColorMap[rgb];
    }

    static removeFromSight(mesh: BABYLON.AbstractMesh) : void {
        mesh.isVisible = false;
        mesh.isPickable = false;
        // TODO: move outside of skybox, instead of hard-coding
        mesh.position.x = 1000;
        mesh.position.y = 1000;
        mesh.position.z = 1000;
    }

}

enum OpacityType {
    TRANSPARENT = 1,
    BLOCK = 2,
    REFLECT = 3,
}

class GameObj {
    meshes: BABYLON.AbstractMesh[] = [];
    stage: GameStage;
    opacityType: OpacityType;
    hitPoints : number;

    static HITPOINTS_INDESTRUCTABLE = 1999999999;

    constructor(stage: GameStage) {
        this.stage = stage;
        this.opacityType = OpacityType.TRANSPARENT;
        this.hitPoints = GameObj.HITPOINTS_INDESTRUCTABLE;
    }

    static createInstance(objType: GameObjType, scene: BABYLON.Scene, board: Board) : GameObj {
        let obj : GameObj = null;
        switch (objType) {
            case GameObjType.GEM_ANY:
                obj = new Gem(board, "");
                break;
            case GameObjType.GEM_R:
                obj = new Gem(board, "r");
                break;
            case GameObjType.GEM_G:
                obj = new Gem(board, "g");
                break;
            case GameObjType.GEM_B:
                obj = new Gem(board, "b");
                break;
            case GameObjType.GEM_RG:
                obj = new Gem(board, "rg");
                break;
            case GameObjType.GEM_RB:
                obj = new Gem(board, "rb");
                break;
            case GameObjType.GEM_GB:
                obj = new Gem(board, "gb");
                break;
            case GameObjType.GEM_RGB:
                obj = new Gem(board, "rgb");
                break;
            case GameObjType.MIRROR:
                obj = new Mirror(board);
                board.mirrors.push(obj as Mirror);
                break;
            case GameObjType.BEAM_SOURCE:
                obj = new BeamSource(board);
                board.beamSrcs.push(obj as BeamSource);
                break;
            default:
                console.log("Unknow object type " + objType);
                return null;
        }
        obj.createMeshes(scene);
        return obj;
    }

    protected afterCreate() : void {}

    protected createMeshes(scene: BABYLON.Scene) : void {
        let meshIds = this.getMeshIds();
        for (let id of meshIds) {
            let template = this.stage.meshTemplates[id];
            if (!template) {
                // Create a mesh as a template for this MeshType
                template = Meshes.createMesh(id, scene, this);
                this.stage.meshTemplates[id] = template;
                Util.removeFromSight(template);
            }
            // Create an instance
            let mesh = template.createInstance(template.name);
            this.addMesh(mesh);
        }
        this.afterCreate();
    }

    getMeshIds() : MeshType[] {
        return [];
    }

    isDestructable() : boolean {
        return (this.hitPoints < GameObj.HITPOINTS_INDESTRUCTABLE);
    }

    setPosition(x:number, y:number, z:number) : void {
        if (this.meshes.length > 0) {
            let pos = this.meshes[0].position;
            pos.x = x;
            pos.y = y;
            pos.z = z;
        }
    }

    addMesh(mesh: BABYLON.AbstractMesh) : void {
        mesh["objRef"] = this;
        if (this.meshes.length > 0)
            mesh.parent = this.meshes[0];
        this.meshes.push(mesh);
    }

    startDispose() : void {
        for (let m of this.meshes) {
            m.isVisible = false;
        }
    }

}