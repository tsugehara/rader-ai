module Ai {
	export enum Operator {
		Equal,
		Over,
		Under,
		Not
	}

	export enum Direction {
		Forward,
		Left,
		Right,
		Back,
		Enemy,
		Random,
		Road
	}

	export enum ContactType {
		Empty,
		Enemy,
		Alliance,
		Road,
		Wall
	}

	export interface RaderInfo {
		distance: number;
		direction: Direction;
		x: number;
		y: number;
	}

	export interface ContactData {
		data: any;	//元データ
		type: ContactType;
	}

	export interface DirectionData {
		data: any;	//判断要素のなった対象の元データ
		direction: Direction;
	}

	export class Action {
		//行動名
		name:string;
		//行動回数
		count:number;
		//行動対象
		target:any;

		constructor() {

		}
	}

	export class Routine {
		statements:Statement[];
		index:number;
		action:Action;
		time:number;
		debug:bool;

		constructor() {
			this.statements = new Statement[];
			this.index = 0;
			this.time = 0;
		}

		next(info:Information):Action {
			var statement = this.statements[this.index];
			var action = statement.execute(info);
			if (this.debug) {
				//if (action && action.name) {
					var txt = [];
					txt.push(statement["constructor"]["name"]);
					txt.push(action ? action.name : "fail("+statement.failStep+")");
					//console.log(txt.join(","));
				//}
			}
			if (action) {
				//Empty action判定（条件分岐通過など）
				if (! action.name) {
					//何もしない
				} else {
					this.action = action;
				}
				this.index++;
				if (statement.postExecute)
					statement.postExecute(this);
			} else {
				this.index += statement.failStep;
			}

			if (this.index >= this.statements.length)
				this.index = 0;

			return action;
		}

		reset() {
			this.index = 0;
			this.action = null;
		}
	}

	export class Information {
		//接触しているもの
		contacts:any;//ContactData[];	//key: Direction, value: ContactData
		//敵とか味方とかの方向
		directions:any;//DirectionData[];	//key: ContactType, value: DirectionData
		//自分自身
		my:any;

		constructor(my?:any) {
			this.contacts = {};
			this.directions = {};
			this.my = my;
		}
	}

	//命令
	export class Statement {
		failStep:number;
		constructor() {
			this.failStep = 1;
		}

		execute(info:Information) {
			return null;
		}

		postExecute(routine:Routine) {
		}
	}

	//行動
	export class ActionStatement extends Statement {
		postReturn:bool;
		constructor() {
			super();
			this.postReturn = true;
		}

		execute(info:Information) {
			return null;
		}

		postExecute(routine:Routine) {
			if (this.postReturn)
				routine.index = 0;
		}
	}

	//攻撃行動
	export class AttackStatement extends ActionStatement {
		count:number;
		constructor() {
			super();
		}

		execute(info:Information) {
			var action = new Action();
			action.name = "attack";
			action.count = this.count;
			return action;
		}
	}

	//移動行動
	export class MoveStatement extends ActionStatement {
		count:number;
		direction:Direction;

		constructor() {
			super();
		}

		execute(info:Information) {
			var action = new Action();
			action.name = "move";
			action.count = this.count;
			if (this.direction == Direction.Enemy) {
				action.target = info.directions[ContactType.Enemy].direction;
			} else if (this.direction == Direction.Road) {
				if (info.contacts[Direction.Forward] && info.contacts[Direction.Forward].type == ContactType.Road) {
					action.target = Direction.Forward;
				} else {
					var r = Math.random() < 0.5 ? Direction.Left : Direction.Right;
					var r2 = r == Direction.Left ? Direction.Right : Direction.Left;
					if (info.contacts[r] && info.contacts[r].type == ContactType.Road) {
						action.target = r;
					} else if (info.contacts[r2] && info.contacts[r2].type == ContactType.Road) {
						action.target = r2;
					} else if (info.contacts[Direction.Back] && info.contacts[Direction.Back].type == ContactType.Road) {
						action.target = Direction.Back;
					} else {
						return null;
					}
				}
			} else if (this.direction == Direction.Random) {
				action.target = Util.getRandomDirection();
			} else {
				action.target = this.direction;
			}
			return action;
		}
	}

	//回転行動
	export class RotateStatement extends ActionStatement {
		direction:Direction;

		constructor() {
			super();
		}

		execute(info:Information) {
			var action = new Action();
			action.name = "rotate";
			action.count = 1;
			if (this.direction == Direction.Enemy) {
				if (! info.directions[ContactType.Enemy])
					return null;
				action.target = info.directions[ContactType.Enemy].direction;
			} else if (this.direction == Direction.Road) {
				if (! info.directions[ContactType.Road])
					return null;
				action.target = info.directions[ContactType.Road].direction;
			} else if (this.direction == Direction.Random) {
				action.target = Util.getRandomDirection();
			} else {
				action.target = this.direction;
			}
			return action;
		}
	}

	//条件
	export class ConditionStatement extends Statement {
		//方向（前後左右）
		direction:Direction;
		//敵、自分、場所
		type:ContactType;
		//体力、総合力
		prop:string;
		//数値
		value:number;
		//比較演算。以上、以下、等価、否定
		operator:Operator;

		constructor() {
			super();
		}

		execute(info:Information) {
			if (this.check(info))
				return new Action();	//return empty action

			return null;
		}

		check(info:Information) {
			return false;
		}
	}

	//隣接している相手の情報を基に判断する条件
	export class ContactConditionStatement extends ConditionStatement {
		constructor() {
			super();
		}

		check(info:Information) {
			var contact = info.contacts[this.direction];
			if (contact == undefined) {
				return false;
			}
			if (contact.type == this.type) {
				if (this.prop) {
					switch (this.operator) {
					case Operator.Equal:
						return contact.data[this.prop] == this.value;

					case Operator.Over:
						return contact.data[this.prop] > this.value;

					case Operator.Under:
						return contact.data[this.prop] < this.value;

					case Operator.Not:
						return contact.data[this.prop] != this.value;

					}
				}
				return true;
			}
			return false;
		}
	}

	//方向の情報を基に判断する条件
	export class DirectionConditionStatement extends ConditionStatement {
		constructor() {
			super();
		}

		check(info:Information) {
			var d = info.directions[this.type];
			if (d == undefined)
				return false;
			if (d.direction != this.direction)
				return false

			if (this.prop) {
				switch (this.operator) {
				case Operator.Equal:
					return d.data[this.prop] == this.value;

				case Operator.Over:
					return d.data[this.prop] > this.value;

				case Operator.Under:
					return d.data[this.prop] < this.value;

				case Operator.Not:
					return d.data[this.prop] != this.value;

				}
			}
			return true;
		}
	}

	//自分自身の情報を基に判断する条件
	export class MyConditionStatement extends ConditionStatement {
		constructor() {
			super();
		}

		check(info:Information) {
			switch (this.operator) {
			case Operator.Equal:
				return info.my.data[this.prop] == this.value;

			case Operator.Over:
				return info.my.data[this.prop] > this.value;

			case Operator.Under:
				return info.my.data[this.prop] < this.value;

			case Operator.Not:
				return info.my.data[this.prop] != this.value;
			}

			return false;
		}
	}

	//0〜99の乱数値を基に判断する条件
	export class RandomConditionStatement extends ConditionStatement {
		constructor() {
			super();
		}

		check(info:Information) {
			var r = Math.floor(Math.random() * 100);
			switch (this.operator) {
			case Operator.Equal:
				return r == this.value;

			case Operator.Over:
				return r > this.value;

			case Operator.Under:
				return r < this.value;

			case Operator.Not:
				return r != this.value;
			}

			return false;
		}
	}

	//基本的なレーダー
	export class Rader {
		max:number;
		offset:CommonOffset;
		sequence:any[];
		firstDirection:Direction;
		rotateDirection:Direction;

		constructor(firstDirection:Direction, rotateDirection:Direction) {
			this.max = 100;
			this.offset = {x: 0, y: 0}
			this.firstDirection = firstDirection;
			this.rotateDirection = rotateDirection;
			this.sequence = [];

			if (this.rotateDirection == Direction.Right) {
				this.sequence.push({x: 0, y:-1, d:Direction.Forward});
				this.sequence.push({x: 1, y: 0, d:Direction.Right});
				this.sequence.push({x: 0, y: 1, d:Direction.Back});
				this.sequence.push({x:-1, y: 0, d:Direction.Left});
			} else if (this.rotateDirection == Direction.Left) {
				this.sequence.push({x: 0, y:-1, d:Direction.Forward});
				this.sequence.push({x:-1, y: 0, d:Direction.Left});
				this.sequence.push({x: 0, y: 1, d:Direction.Back});
				this.sequence.push({x: 1, y: 0, d:Direction.Right});
			} else
				throw "Invalid rotateDirection. (Only right or left)"
			switch (this.firstDirection) {
				case Direction.Forward:
					this.sequence.push({x: 0, y:-1, d:Direction.Forward});
				break;
				case Direction.Right:
					if (this.rotateDirection == Direction.Right) {
						this.sequence.push(this.sequence.shift());
					} else {
						this.sequence.push(this.sequence.shift());
						this.sequence.push(this.sequence.shift());
						this.sequence.push(this.sequence.shift());
					}
					this.sequence.push({x: 1, y: 0, d:Direction.Right});
				break;
				case Direction.Back:
					this.sequence.push(this.sequence.shift());
					this.sequence.push(this.sequence.shift());
					this.sequence.push({x: 0, y: 1, d:Direction.Back});
				break;
				case Direction.Left:
					if (this.rotateDirection == Direction.Right) {
						this.sequence.push(this.sequence.shift());
						this.sequence.push(this.sequence.shift());
						this.sequence.push(this.sequence.shift());
					} else {
						this.sequence.push(this.sequence.shift());
					}
					this.sequence.push({x:-1, y: 0, d:Direction.Left});
				break;
			}
		}

		search(caller:any, callback:Function) {
			var power = 1;
			var pos = {x: 0, y: 0}

			if (callback.call(caller, {
					distance: 0,
					direction: Direction.Forward,
					x: this.offset.x,
					y: this.offset.y
				}) == false)
				return;

			do {
				var plen = power * 4;
				for (var i=0; i<plen; i++) {
					var j = i % power;
					var k = Math.floor(i / power);
					var l = power - j;

					pos = {
						x: Math.round(
							power * this.sequence[k].x * l / power
							+ power * this.sequence[k+1].x * j / power
						),
						y: Math.round(
							power * this.sequence[k].y * l / power
							+ power * this.sequence[k+1].y * j / power
						)
					}
					if (callback.call(caller, {
							distance: power,
							direction: j > l ? this.sequence[k+1].d : this.sequence[k].d,
							x: pos.x+this.offset.x,
							y: pos.y+this.offset.y
						}) == false)
						return;
				}
				power++;
			} while(power < this.max);
		}
	}

	//レーダーで用いるためのマップ
	export class RotableMap {
		map:any[][][];
		size:any;
		constructor(map:any[][]) {
			this.map = [];
			this.map[Angle.up] = map;
			this.map[Angle.down] = [];
			this.map[Angle.left] = [];
			this.map[Angle.right] = [];
			var w = map.length;
			var h = map[0].length;
			var m = Math.max(w, h);
			this.size = {
				w: w,
				h: h,
				m: m
			}
			var x2, y2;
			for (var x = 0; x < m; x++) {
				this.map[Angle.down][x] = [];
				this.map[Angle.left][x] = [];
				this.map[Angle.right][x] = [];

				for (var y = 0; y < m; y++) {
					x2 = m - x - 1;
					y2 = m - y - 1;
					if (x2 < w && y2 < h && x2 >= 0 && y2 >= 0)
						this.map[Angle.down ][x][y] = map[x2][y2];
					else
						this.map[Angle.down ][x][y] = false;

					x2 = y;
					y2 = m - x - 1;
					if (x2 < w && y2 < h && x2 >= 0 && y2 >= 0)
						this.map[Angle.left ][x][y] = map[x2][y2];
					else 
						this.map[Angle.left ][x][y] = false;

					x2 = m - y - 1;
					y2 = x;
					if (x2 < w && y2 < h && x2 >= 0 && y2 >= 0)
						this.map[Angle.right][x][y] = map[x2][y2];
					else
						this.map[Angle.right][x][y] = false;
				}
			}
		}

		getPos(pos:CommonOffset, angle:Angle):CommonOffset {
			switch(angle) {
				case Angle.up:
					return pos;
				case Angle.right:
					return {
						x: pos.y,
						y: this.size.m-pos.x-1
					}
				case Angle.down:
					return {
						x: this.size.m-pos.x-1,
						y: this.size.m-pos.y-1
					}
				case Angle.left:
					return {
						x: this.size.m - pos.y - 1,
						y: pos.x
					}
			}
			throw "invalid parameter";
		}

		get(x:number, y:number, angle:Angle) {
			if (x < 0 || y < 0 || x >= this.map[angle].length || y >= this.map[angle][0].length)
				return false;

			return this.map[angle][x][y];
		}
	}

	//BasicRaderHandlerで使うためのマップチップ構成
	export interface BasicCharacter {
		team_id: number;
		is_dead: bool;
		x: number;
		y: number;
	}
	export interface BasicMapChip {
		c:BasicCharacter[];
		chip:any;
	}

	//基本的なレーダー処理。ソースコードサンプル用
	export class BasicRaderHandler {
		static rader:Rader;
		baseMap:BasicMapChip[][];
		info:Information;
		map:RotableMap;
		enemy_id:number;
		alliance_id:number;
		chara:Character;
		debug:bool;
		debugInfo:number[][];
		chipSize: CommonSize;

		constructor(baseMap:BasicMapChip[][], chipSize:CommonSize) {
			this.baseMap = baseMap;
			this.map = new RotableMap(baseMap);
			this.info = new Information();
			this.chipSize = chipSize;
			if (! BasicRaderHandler.rader) {
				BasicRaderHandler.rader = new Rader(Direction.Forward, Direction.Right);
				BasicRaderHandler.rader.max = this.baseMap.length * 2;
			}
		}

		setCharacterInfo(chara:Character, alliance_id:number, enemy_id:number) {
			this.chara = chara;
			this.alliance_id = alliance_id;
			this.enemy_id = enemy_id;
			BasicRaderHandler.rader.offset = this.map.getPos(
				{
					x: Math.floor(this.chara.x / this.chipSize.width),
					y: Math.floor(this.chara.y / this.chipSize.height)
				},
				this.chara.currentAngle
			);
			this.info = new Information(chara);
		}

		search() {
			BasicRaderHandler.rader.search(this, this.raderCallback);
			return this.info;
		}

		raderCallback(info:RaderInfo) {
			var chip = this.map.get(info.x, info.y, this.chara.currentAngle);
			if (chip === false)
				return true;

			if (this.debug)
				this.map.map[this.chara.currentAngle][info.x][info.y].chip = -info.distance;

			if (info.distance <= 1) {
				for (var i=0; i<chip.c.length; i++) {
					if (chip.c[i] == this.chara || chip.c[i].is_dead)
						continue;
					var type = chip.c[i].team_id == this.alliance_id ? ContactType.Alliance : ContactType.Enemy;
					//先優先（ただし仲間の場合は上書き）
					if (this.info.contacts[info.direction] && this.info.contacts[info.direction].type != ContactType.Alliance) {
						if (! this.info.directions[type]) {
							this.info.directions[type] = {direction: info.direction, data: chip.c[i]}
						}
						continue;
					}
					var contact:ContactData = {
						data: chip.c[i],
						type: type
					}

					this.info.contacts[info.direction] = contact;
					if (! this.info.directions[type])
						this.info.directions[type] = {direction: info.direction, data: chip.c[i]}
				}

				if (info.distance == 1 && !this.info.contacts[info.direction])
					this.info.contacts[info.direction] = {data:null, type:ContactType.Road};

				return true;
			}

			//ここに終了条件
			if (this.info.directions[ContactType.Enemy])
				return false;

			for (var i=0; i<chip.c.length; i++) {
				if (chip.c[i] == this.chara || chip.c[i].is_dead)
					continue;
				if (chip.c[i].team_id == this.enemy_id) {
					this.info.directions[ContactType.Enemy] = {
						direction: info.direction,
						data: chip.c[i]
					}
					return true;
				}
			}
			return true;
		}
	}

	export class Util {
		static splitText(s:string):string[] {
			var ret = [];
			var start = 0;
			for (var i=0; i<s.length; i++) {
				var j = s.charCodeAt(i);
				if (j == 10 || j == 13) {
					if (start != i)
						ret.push(s.substr(start, i-start));
					start = i+1;
				}
			}
			return ret;
		}

		static countTab(s:string):number {
			for (var i=0; i<s.length; i++)
				if (s.charCodeAt(i) != 9)
					return i;
			return 0;	//overflow
		}

		static getDirectionByText(s:string):Direction {
			switch(s) {
				case "前":
					return Direction.Forward;
				case "右":
					return Direction.Right;
				case "左":
					return Direction.Left;
				case "後":
					return Direction.Back;
				case "敵":
					return Direction.Enemy;
				case "ランダム":
					return Direction.Random;
				case "道":
					return Direction.Road;
			}
			throw "error";
		}

		static getContactTypeByText(s:string):ContactType {
			switch(s) {
				case "敵":
					return ContactType.Enemy;
				case "味方":
					return ContactType.Alliance;
				case "道":
					return ContactType.Road;
				case "壁":
					return ContactType.Wall;
			}
		}

		static getOperatorByText(s:string):Operator {
			switch (s) {
				case ">":
					return Operator.Over;
				case "<":
					return Operator.Under;
				case "=":
					return Operator.Equal;
				case "!":
					return Operator.Not;
			}
		}

		static statementCompile(s:any):Statement {
			var markup = new RegExp("\\[([^\\]]+)\\]", "ig");
			var statementText = s.text.match(markup);
			var l = [];
			for (var i=0; i<statementText.length; i++)
				l.push(statementText[i].substr(1, statementText[i].length-2));

			var statement = null;
			if (l[0] == "判断") {
				if (l[1] == "隣接") {
					statement = new ContactConditionStatement();
					statement.direction = Util.getDirectionByText(l[2]);
					statement.type = Util.getContactTypeByText(l[3]);
					if (l.length > 4) {
						statement.prop = l[4];
						statement.value = parseInt(l[5]);
						statement.operator = Util.getOperatorByText(l[6]);
					}
				} else if (l[1] == "方向") {
					statement = new DirectionConditionStatement();
					statement.type = Util.getContactTypeByText(l[2]);
					statement.direction = Util.getDirectionByText(l[3]);
					if (l.length > 4) {
						statement.prop = l[4];
						statement.value = parseInt(l[5]);
						statement.operator = Util.getOperatorByText(l[6]);
					}
				} else if (l[1] == "自分") {
					statement = new MyConditionStatement();
					statement.prop = l[2];
					statement.value = parseInt(l[3]);
					statement.operator = Util.getOperatorByText(l[4]);
				} else if (l[1] == "ランダム") {
					statement = new RandomConditionStatement();
					statement.value = parseInt(l[2]);
					statement.operator = Util.getOperatorByText(l[3]);
				}
			} else if (l[0] == "移動") {
				statement = new MoveStatement();
				statement.direction = Util.getDirectionByText(l[1]);
				statement.count = parseInt(l[2]);
			} else if (l[0] == "回転") {
				statement = new RotateStatement();
				statement.direction = Util.getDirectionByText(l[1]);
		 	} else if (l[0] == "攻撃") {
				statement = new AttackStatement();
				statement.count = parseInt(l[1]);
		 	}
		 	if (s.fail_step > 1) {
		 		statement.failStep = s.fail_step;
		 	}
		 	return statement;
		}

		static routineCompile(s:string):Routine {
			var lines = Util.splitText(s);
			var routine = new Routine();
			var new_lines = [];
			var parent = null;
			for (var i=0; i<lines.length; i++) {
				if (! parent) {
					parent = {
						tab: Util.countTab(lines[i]),
						text: lines[i],
						fail_step: 1
					}
				}
				var row = {
					tab: Util.countTab(lines[i]),
					text: lines[i],
					fail_step: 1
				}
				if (parent.tab < row.tab) {
					parent.fail_step++;
				} else {
					parent = row;
				}
				new_lines.push(row);
			}
			for (var i=0; i<new_lines.length; i++) {
				var statement = Util.statementCompile(new_lines[i]);
				routine.statements.push(statement);
			}

			return routine;
		}

		static getAngleByDirection(angle:Angle, direction:Direction) {
			switch (direction) {
			case Direction.Forward:
				return angle;
			break;
			case Direction.Right:
				switch (angle) {
					case Angle.up:
						return Angle.right;
					case Angle.down:
						return Angle.left;
					case Angle.right:
						return Angle.down;
					case Angle.left:
						return Angle.up;
				}
			break;
			case Direction.Left:
				switch (angle) {
					case Angle.up:
						return Angle.left;
					case Angle.down:
						return Angle.right;
					case Angle.right:
						return Angle.up;
					case Angle.left:
						return Angle.down;
				}
			break;
			case Direction.Back:
				switch (angle) {
					case Angle.up:
						return Angle.down;
					case Angle.down:
						return Angle.up;
					case Angle.right:
						return Angle.left;
					case Angle.left:
						return Angle.right;
				}
			break;
			}
		}

		static getAngleString(angle:Angle):string {
			switch (angle) {
				case Angle.up:
					return "Up";
				case Angle.down:
					return "Down";
				case Angle.left:
					return "Left";
				case Angle.right:
					return "Right";
			}
		}

		static getDirectionString(direction:Direction):string {
			switch (direction) {
				case Direction.Forward:
					return "Forward";
				case Direction.Back:
					return "Back";
				case Direction.Left:
					return "Left";
				case Direction.Right:
					return "Right";
			}
		}

		static getRandomDirection():Direction {
			var r = Math.floor(Math.random() * 100);
			if (r < 25) {
				return Direction.Forward;
			} else if (r < 50) {
				return Direction.Back;
			} else if (r < 75) {
				return Direction.Right;
			} else {
				return Direction.Left;
			}
		}
	}
}