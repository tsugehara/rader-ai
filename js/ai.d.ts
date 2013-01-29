module Ai {
    enum Operator {
        Equal,
        Over,
        Under,
        Not,
    }
    enum Direction {
        Forward,
        Left,
        Right,
        Back,
        Enemy,
        Random,
        Road,
    }
    enum ContactType {
        Empty,
        Enemy,
        Alliance,
        Road,
        Wall,
    }
    interface RaderInfo {
        distance: number;
        direction: Direction;
        x: number;
        y: number;
    }
    interface ContactData {
        data: any;
        type: ContactType;
    }
    interface DirectionData {
        data: any;
        direction: Direction;
    }
    class Action {
        public name: string;
        public count: number;
        public target: any;
        constructor ();
    }
    class Routine {
        public statements: Statement[];
        public index: number;
        public action: Action;
        public time: number;
        public debug: bool;
        constructor ();
        public next(info: Information): Action;
        public reset(): void;
    }
    class Information {
        public contacts: any;
        public directions: any;
        public my: any;
        constructor (my?: any);
    }
    class Statement {
        public failStep: number;
        constructor ();
        public execute(info: Information);
        public postExecute(routine: Routine): void;
    }
    class ActionStatement extends Statement {
        public postReturn: bool;
        constructor ();
        public execute(info: Information);
        public postExecute(routine: Routine): void;
    }
    class AttackStatement extends ActionStatement {
        public count: number;
        constructor ();
        public execute(info: Information): Action;
    }
    class MoveStatement extends ActionStatement {
        public count: number;
        public direction: Direction;
        constructor ();
        public execute(info: Information): Action;
    }
    class RotateStatement extends ActionStatement {
        public direction: Direction;
        constructor ();
        public execute(info: Information): Action;
    }
    class ConditionStatement extends Statement {
        public direction: Direction;
        public type: ContactType;
        public prop: string;
        public value: number;
        public operator: Operator;
        constructor ();
        public execute(info: Information): Action;
        public check(info: Information): bool;
    }
    class ContactConditionStatement extends ConditionStatement {
        constructor ();
        public check(info: Information): bool;
    }
    class DirectionConditionStatement extends ConditionStatement {
        constructor ();
        public check(info: Information): bool;
    }
    class MyConditionStatement extends ConditionStatement {
        constructor ();
        public check(info: Information): bool;
    }
    class RandomConditionStatement extends ConditionStatement {
        constructor ();
        public check(info: Information): bool;
    }
    class Rader {
        public max: number;
        public offset: CommonOffset;
        public sequence: any[];
        public firstDirection: Direction;
        public rotateDirection: Direction;
        constructor (firstDirection: Direction, rotateDirection: Direction);
        public search(caller: any, callback: Function): void;
    }
    class RotableMap {
        public map: any[][][];
        public size: any;
        constructor (map: any[][]);
        public getPos(pos: CommonOffset, angle: Angle): CommonOffset;
        public get(x: number, y: number, angle: Angle);
    }
    interface BasicCharacter {
        team_id: number;
        is_dead: bool;
        x: number;
        y: number;
    }
    interface BasicMapChip {
        c: BasicCharacter[];
        chip: any;
    }
    class BasicRaderHandler {
        static rader: Rader;
        public baseMap: BasicMapChip[][];
        public info: Information;
        public map: RotableMap;
        public enemy_id: number;
        public alliance_id: number;
        public chara: Character;
        public debug: bool;
        public debugInfo: number[][];
        public chipSize: CommonSize;
        constructor (baseMap: BasicMapChip[][], chipSize: CommonSize);
        public setCharacterInfo(chara: Character, alliance_id: number, enemy_id: number): void;
        public search(): Information;
        public raderCallback(info: RaderInfo): bool;
    }
    class Util {
        static splitText(s: string): string[];
        static countTab(s: string): number;
        static getDirectionByText(s: string): Direction;
        static getContactTypeByText(s: string): ContactType;
        static getOperatorByText(s: string): Operator;
        static statementCompile(s: any): Statement;
        static routineCompile(s: string): Routine;
        static getAngleByDirection(angle: Angle, direction: Direction): Angle;
        static getAngleString(angle: Angle): string;
        static getDirectionString(direction: Direction): string;
        static getRandomDirection(): Direction;
    }
}
