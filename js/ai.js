var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Ai;
(function (Ai) {
    (function (Operator) {
        Operator._map = [];
        Operator._map[0] = "Equal";
        Operator.Equal = 0;
        Operator._map[1] = "Over";
        Operator.Over = 1;
        Operator._map[2] = "Under";
        Operator.Under = 2;
        Operator._map[3] = "Not";
        Operator.Not = 3;
    })(Ai.Operator || (Ai.Operator = {}));
    var Operator = Ai.Operator;
    (function (Direction) {
        Direction._map = [];
        Direction._map[0] = "Forward";
        Direction.Forward = 0;
        Direction._map[1] = "Left";
        Direction.Left = 1;
        Direction._map[2] = "Right";
        Direction.Right = 2;
        Direction._map[3] = "Back";
        Direction.Back = 3;
        Direction._map[4] = "Enemy";
        Direction.Enemy = 4;
        Direction._map[5] = "Random";
        Direction.Random = 5;
    })(Ai.Direction || (Ai.Direction = {}));
    var Direction = Ai.Direction;
    (function (ContactType) {
        ContactType._map = [];
        ContactType._map[0] = "Empty";
        ContactType.Empty = 0;
        ContactType._map[1] = "Enemy";
        ContactType.Enemy = 1;
        ContactType._map[2] = "Alliance";
        ContactType.Alliance = 2;
        ContactType._map[3] = "Road";
        ContactType.Road = 3;
        ContactType._map[4] = "Wall";
        ContactType.Wall = 4;
    })(Ai.ContactType || (Ai.ContactType = {}));
    var ContactType = Ai.ContactType;
    var Action = (function () {
        function Action() {
        }
        return Action;
    })();
    Ai.Action = Action;    
    var Routine = (function () {
        function Routine() {
            this.statements = new Array();
            this.index = 0;
            this.time = 0;
        }
        Routine.prototype.next = function (info) {
            if(this.index >= this.statements.length) {
                throw "invalid status";
            }
            var statement = this.statements[this.index];
            var action = statement.execute(info);
            if(action) {
                if(!action.name) {
                } else {
                    this.action = action;
                }
                this.index++;
                if(statement.postExecute) {
                    statement.postExecute(this);
                }
            } else {
                this.index += statement.failStep;
            }
            if(this.index >= this.statements.length) {
                this.index = 0;
            }
            return action;
        };
        Routine.prototype.reset = function () {
            this.index = 0;
            this.action = null;
        };
        return Routine;
    })();
    Ai.Routine = Routine;    
    var Information = (function () {
        function Information(my) {
            this.contacts = new Array();
            this.directions = new Array();
            this.my = my;
        }
        return Information;
    })();
    Ai.Information = Information;    
    var Statement = (function () {
        function Statement() {
            this.failStep = 1;
        }
        Statement.prototype.execute = function (info) {
            return null;
        };
        Statement.prototype.postExecute = function (routine) {
        };
        return Statement;
    })();
    Ai.Statement = Statement;    
    var ActionStatement = (function (_super) {
        __extends(ActionStatement, _super);
        function ActionStatement() {
                _super.call(this);
            this.postReturn = true;
        }
        ActionStatement.prototype.execute = function (info) {
            return null;
        };
        ActionStatement.prototype.postExecute = function (routine) {
            if(this.postReturn) {
                routine.index = 0;
            }
        };
        return ActionStatement;
    })(Statement);
    Ai.ActionStatement = ActionStatement;    
    var AttackStatement = (function (_super) {
        __extends(AttackStatement, _super);
        function AttackStatement() {
                _super.call(this);
        }
        AttackStatement.prototype.execute = function (info) {
            var action = new Action();
            action.name = "attack";
            action.count = this.count;
            return action;
        };
        return AttackStatement;
    })(ActionStatement);
    Ai.AttackStatement = AttackStatement;    
    var MoveStatement = (function (_super) {
        __extends(MoveStatement, _super);
        function MoveStatement() {
                _super.call(this);
        }
        MoveStatement.prototype.execute = function (info) {
            var action = new Action();
            action.name = "move";
            action.count = this.count;
            if(this.direction == Direction.Enemy) {
                action.target = info.directions[ContactType.Enemy].direction;
            } else {
                if(this.direction == Direction.Random) {
                    action.target = Util.getRandomDirection();
                } else {
                    action.target = this.direction;
                }
            }
            return action;
        };
        return MoveStatement;
    })(ActionStatement);
    Ai.MoveStatement = MoveStatement;    
    var RotateStatement = (function (_super) {
        __extends(RotateStatement, _super);
        function RotateStatement() {
                _super.call(this);
        }
        RotateStatement.prototype.execute = function (info) {
            var action = new Action();
            action.name = "rotate";
            action.count = 1;
            if(this.direction == Direction.Enemy) {
                action.target = info.directions[ContactType.Enemy].direction;
            } else {
                if(this.direction == Direction.Random) {
                    action.target = Util.getRandomDirection();
                } else {
                    action.target = this.direction;
                }
            }
            return action;
        };
        return RotateStatement;
    })(ActionStatement);
    Ai.RotateStatement = RotateStatement;    
    var ConditionStatement = (function (_super) {
        __extends(ConditionStatement, _super);
        function ConditionStatement() {
                _super.call(this);
        }
        ConditionStatement.prototype.execute = function (info) {
            if(this.check(info)) {
                return new Action();
            }
            return null;
        };
        ConditionStatement.prototype.check = function (info) {
            return false;
        };
        return ConditionStatement;
    })(Statement);
    Ai.ConditionStatement = ConditionStatement;    
    var ContactConditionStatement = (function (_super) {
        __extends(ContactConditionStatement, _super);
        function ContactConditionStatement() {
                _super.call(this);
        }
        ContactConditionStatement.prototype.check = function (info) {
            var contact = info.contacts[this.direction];
            if(contact == undefined) {
                return false;
            }
            if(contact.type == this.type) {
                if(this.prop) {
                    switch(this.operator) {
                        case Operator.Equal: {
                            return contact.data[this.prop] == this.value;

                        }
                        case Operator.Over: {
                            return contact.data[this.prop] > this.value;

                        }
                        case Operator.Under: {
                            return contact.data[this.prop] < this.value;

                        }
                        case Operator.Not: {
                            return contact.data[this.prop] != this.value;

                        }
                    }
                }
                return true;
            }
            return false;
        };
        return ContactConditionStatement;
    })(ConditionStatement);
    Ai.ContactConditionStatement = ContactConditionStatement;    
    var DirectionConditionStatement = (function (_super) {
        __extends(DirectionConditionStatement, _super);
        function DirectionConditionStatement() {
                _super.call(this);
        }
        DirectionConditionStatement.prototype.check = function (info) {
            var d = info.directions[this.type];
            if(d == undefined) {
                return false;
            }
            if(d.direction != this.direction) {
                return false;
            }
            if(this.prop) {
                switch(this.operator) {
                    case Operator.Equal: {
                        return d.data[this.prop] == this.value;

                    }
                    case Operator.Over: {
                        return d.data[this.prop] > this.value;

                    }
                    case Operator.Under: {
                        return d.data[this.prop] < this.value;

                    }
                    case Operator.Not: {
                        return d.data[this.prop] != this.value;

                    }
                }
            }
            return true;
        };
        return DirectionConditionStatement;
    })(ConditionStatement);
    Ai.DirectionConditionStatement = DirectionConditionStatement;    
    var MyConditionStatement = (function (_super) {
        __extends(MyConditionStatement, _super);
        function MyConditionStatement() {
                _super.call(this);
        }
        MyConditionStatement.prototype.check = function (info) {
            switch(this.operator) {
                case Operator.Equal: {
                    return info.my.data[this.prop] == this.value;

                }
                case Operator.Over: {
                    return info.my.data[this.prop] > this.value;

                }
                case Operator.Under: {
                    return info.my.data[this.prop] < this.value;

                }
                case Operator.Not: {
                    return info.my.data[this.prop] != this.value;

                }
            }
            return false;
        };
        return MyConditionStatement;
    })(ConditionStatement);
    Ai.MyConditionStatement = MyConditionStatement;    
    var RandomConditionStatement = (function (_super) {
        __extends(RandomConditionStatement, _super);
        function RandomConditionStatement() {
                _super.call(this);
        }
        RandomConditionStatement.prototype.check = function (info) {
            var r = Math.floor(Math.random() * 100);
            switch(this.operator) {
                case Operator.Equal: {
                    return r == this.value;

                }
                case Operator.Over: {
                    return r > this.value;

                }
                case Operator.Under: {
                    return r < this.value;

                }
                case Operator.Not: {
                    return r != this.value;

                }
            }
            return false;
        };
        return RandomConditionStatement;
    })(ConditionStatement);
    Ai.RandomConditionStatement = RandomConditionStatement;    
    var Rader = (function () {
        function Rader(firstDirection, rotateDirection) {
            this.max = 100;
            this.offset = {
                x: 0,
                y: 0
            };
            this.firstDirection = firstDirection;
            this.rotateDirection = rotateDirection;
            this.sequence = [];
            if(this.rotateDirection == Direction.Right) {
                this.sequence.push({
                    x: 0,
                    y: -1,
                    d: Direction.Forward
                });
                this.sequence.push({
                    x: 1,
                    y: 0,
                    d: Direction.Right
                });
                this.sequence.push({
                    x: 0,
                    y: 1,
                    d: Direction.Back
                });
                this.sequence.push({
                    x: -1,
                    y: 0,
                    d: Direction.Left
                });
            } else {
                if(this.rotateDirection == Direction.Left) {
                    this.sequence.push({
                        x: 0,
                        y: -1,
                        d: Direction.Forward
                    });
                    this.sequence.push({
                        x: -1,
                        y: 0,
                        d: Direction.Left
                    });
                    this.sequence.push({
                        x: 0,
                        y: 1,
                        d: Direction.Back
                    });
                    this.sequence.push({
                        x: 1,
                        y: 0,
                        d: Direction.Right
                    });
                } else {
                    throw "Invalid rotateDirection. (Only right or left)";
                }
            }
            switch(this.firstDirection) {
                case Direction.Forward: {
                    this.sequence.push({
                        x: 0,
                        y: -1,
                        d: Direction.Forward
                    });
                    break;

                }
                case Direction.Right: {
                    if(this.rotateDirection == Direction.Right) {
                        this.sequence.push(this.sequence.shift());
                    } else {
                        this.sequence.push(this.sequence.shift());
                        this.sequence.push(this.sequence.shift());
                        this.sequence.push(this.sequence.shift());
                    }
                    this.sequence.push({
                        x: 1,
                        y: 0,
                        d: Direction.Right
                    });
                    break;

                }
                case Direction.Back: {
                    this.sequence.push(this.sequence.shift());
                    this.sequence.push(this.sequence.shift());
                    this.sequence.push({
                        x: 0,
                        y: 1,
                        d: Direction.Back
                    });
                    break;

                }
                case Direction.Left: {
                    if(this.rotateDirection == Direction.Right) {
                        this.sequence.push(this.sequence.shift());
                        this.sequence.push(this.sequence.shift());
                        this.sequence.push(this.sequence.shift());
                    } else {
                        this.sequence.push(this.sequence.shift());
                    }
                    this.sequence.push({
                        x: -1,
                        y: 0,
                        d: Direction.Left
                    });
                    break;

                }
            }
        }
        Rader.prototype.search = function (caller, callback) {
            var power = 1;
            var pos = {
                x: 0,
                y: 0
            };
            if(callback.call(caller, {
                distance: 0,
                direction: Direction.Forward,
                x: pos.x + this.offset.x,
                y: pos.y + this.offset.y
            }) == false) {
                return;
            }
            do {
                var plen = power * 4;
                for(var i = 0; i < plen; i++) {
                    var j = i % power;
                    var k = Math.floor(i / power);
                    var l = power - j;
                    pos = {
                        x: Math.round(power * this.sequence[k].x * l / power + power * this.sequence[k + 1].x * j / power),
                        y: Math.round(power * this.sequence[k].y * l / power + power * this.sequence[k + 1].y * j / power)
                    };
                    if(callback.call(caller, {
                        distance: power,
                        direction: j > l ? this.sequence[k + 1].d : this.sequence[k].d,
                        x: pos.x + this.offset.x,
                        y: pos.y + this.offset.y
                    }) == false) {
                        return;
                    }
                }
                power++;
            }while(power < this.max)
        };
        return Rader;
    })();
    Ai.Rader = Rader;    
    var RotableMap = (function () {
        function RotableMap(map) {
            this.map = [];
            this.map[Angle.up] = map;
            this.map[Angle.down] = [];
            this.map[Angle.left] = [];
            this.map[Angle.right] = [];
            var w = map.length;
            var h = map[0].length;
            var m = Math.max(w, h);
            var x2, y2;
            for(var x = 0; x < w; x++) {
                this.map[Angle.down][x] = [];
                this.map[Angle.left][x] = [];
                this.map[Angle.right][x] = [];
                for(var y = 0; y < h; y++) {
                    x2 = y;
                    y2 = w - x - 1;
                    this.map[Angle.left][x][y] = map[x2][y2];
                    x2 = y2;
                    y2 = h - y - 1;
                    this.map[Angle.down][x][y] = map[x2][y2];
                    x2 = y2;
                    y2 = x;
                    this.map[Angle.right][x][y] = map[x2][y2];
                }
            }
        }
        RotableMap.prototype.getPos = function (pos, angle, size) {
            switch(angle) {
                case Angle.up: {
                    return pos;

                }
                case Angle.right: {
                    return {
                        x: pos.y,
                        y: size.width - pos.x - 1
                    };

                }
                case Angle.down: {
                    return {
                        x: size.width - pos.x - 1,
                        y: size.height - pos.y - 1
                    };

                }
                case Angle.left: {
                    return {
                        x: size.height - pos.y - 1,
                        y: pos.x
                    };

                }
            }
            throw "invalid parameter";
        };
        RotableMap.prototype.get = function (x, y, angle) {
            if(x < 0 || y < 0 || x >= this.map[angle].length || y >= this.map[angle][0].length) {
                return false;
            }
            return this.map[angle][x][y];
        };
        return RotableMap;
    })();
    Ai.RotableMap = RotableMap;    
    var BasicRaderHandler = (function () {
        function BasicRaderHandler(baseMap) {
            this.baseMap = baseMap;
            this.map = new RotableMap(baseMap);
            this.info = new Information();
            if(!BasicRaderHandler.rader) {
                BasicRaderHandler.rader = new Rader(Direction.Forward, Direction.Right);
                BasicRaderHandler.rader.max = this.baseMap.length * 2;
            }
        }
        BasicRaderHandler.rader = null;
        BasicRaderHandler.prototype.setCharacterInfo = function (chara, alliance_id, enemy_id) {
            this.chara = chara;
            this.alliance_id = alliance_id;
            this.enemy_id = enemy_id;
            BasicRaderHandler.rader.offset = this.map.getPos({
                x: Math.floor(this.chara.x / 32),
                y: Math.floor(this.chara.y / 32)
            }, this.chara.currentAngle, {
                width: this.map.map[this.chara.currentAngle].length,
                height: this.map.map[this.chara.currentAngle][0].length
            });
            this.info = new Information(chara);
        };
        BasicRaderHandler.prototype.search = function () {
            BasicRaderHandler.rader.search(this, this.raderCallback);
            return this.info;
        };
        BasicRaderHandler.prototype.raderCallback = function (info) {
            var chip = this.map.get(info.x, info.y, this.chara.currentAngle);
            if(chip === false) {
                return true;
            }
            if(this.debug) {
                this.map.map[this.chara.currentAngle][info.x][info.y].chip = -info.distance;
            }
            if(info.distance <= 1) {
                for(var i = 0; i < chip.c.length; i++) {
                    if(chip.c[i] == this.chara) {
                        continue;
                    }
                    if(this.info.contacts[info.direction]) {
                        continue;
                    }
                    var contact = {
                        data: chip.c[i],
                        type: null
                    };
                    switch(chip.c[i].team_id) {
                        case this.alliance_id: {
                            contact.type = ContactType.Alliance;
                            break;

                        }
                        case this.enemy_id: {
                            contact.type = ContactType.Enemy;
                            break;

                        }
                    }
                    this.info.contacts[info.direction] = contact;
                    if(!this.info.directions[contact.type]) {
                        this.info.directions[contact.type] = {
                            direction: info.direction,
                            data: chip.c[i]
                        };
                    }
                }
                return true;
            }
            if(this.info.directions[ContactType.Enemy]) {
                return false;
            }
            for(var i = 0; i < chip.c.length; i++) {
                if(chip.c[i] == this.chara) {
                    continue;
                }
                if(chip.c[i].team_id == this.enemy_id) {
                    this.info.directions[ContactType.Enemy] = {
                        direction: info.direction,
                        data: chip.c[i]
                    };
                    return true;
                }
            }
            return true;
        };
        return BasicRaderHandler;
    })();
    Ai.BasicRaderHandler = BasicRaderHandler;    
    var Util = (function () {
        function Util() { }
        Util.splitText = function splitText(s) {
            var ret = [];
            var start = 0;
            for(var i = 0; i < s.length; i++) {
                var j = s.charCodeAt(i);
                if(j == 10 || j == 13) {
                    if(start != i) {
                        ret.push(s.substr(start, i - start));
                    }
                    start = i + 1;
                }
            }
            return ret;
        }
        Util.countTab = function countTab(s) {
            for(var i = 0; i < s.length; i++) {
                if(s.charCodeAt(i) != 9) {
                    return i;
                }
            }
            return 0;
        }
        Util.getDirectionByText = function getDirectionByText(s) {
            switch(s) {
                case "前": {
                    return Direction.Forward;

                }
                case "右": {
                    return Direction.Right;

                }
                case "左": {
                    return Direction.Left;

                }
                case "後": {
                    return Direction.Back;

                }
                case "敵": {
                    return Direction.Enemy;

                }
                case "ランダム": {
                    return Direction.Random;

                }
            }
            throw "error";
        }
        Util.getContactTypeByText = function getContactTypeByText(s) {
            switch(s) {
                case "敵": {
                    return ContactType.Enemy;

                }
                case "味方": {
                    return ContactType.Alliance;

                }
                case "道": {
                    return ContactType.Road;

                }
                case "壁": {
                    return ContactType.Wall;

                }
            }
        }
        Util.getOperatorByText = function getOperatorByText(s) {
            switch(s) {
                case ">": {
                    return Operator.Over;

                }
                case "<": {
                    return Operator.Under;

                }
                case "=": {
                    return Operator.Equal;

                }
                case "!": {
                    return Operator.Not;

                }
            }
        }
        Util.statementCompile = function statementCompile(s) {
            var markup = new RegExp("\\[([^\\]]+)\\]", "ig");
            var statementText = s.text.match(markup);
            var l = [];
            for(var i = 0; i < statementText.length; i++) {
                l.push(statementText[i].substr(1, statementText[i].length - 2));
            }
            var statement = null;
            if(l[0] == "判断") {
                if(l[1] == "隣接") {
                    statement = new ContactConditionStatement();
                    statement.direction = Util.getDirectionByText(l[2]);
                    statement.type = Util.getContactTypeByText(l[3]);
                    if(l.length > 4) {
                        statement.prop = l[4];
                        statement.value = parseInt(l[5]);
                        statement.operator = Util.getOperatorByText(l[6]);
                    }
                } else {
                    if(l[1] == "方向") {
                        statement = new DirectionConditionStatement();
                        statement.type = Util.getContactTypeByText(l[2]);
                        statement.direction = Util.getDirectionByText(l[3]);
                        if(l.length > 4) {
                            statement.prop = l[4];
                            statement.value = parseInt(l[5]);
                            statement.operator = Util.getOperatorByText(l[6]);
                        }
                    } else {
                        if(l[1] == "自分") {
                            statement = new MyConditionStatement();
                            statement.prop = l[2];
                            statement.value = parseInt(l[3]);
                            statement.operator = Util.getOperatorByText(l[4]);
                        } else {
                            if(l[1] == "ランダム") {
                                statement = new RandomConditionStatement();
                                statement.value = parseInt(l[2]);
                                statement.operator = Util.getOperatorByText(l[3]);
                            }
                        }
                    }
                }
            } else {
                if(l[0] == "移動") {
                    statement = new MoveStatement();
                    statement.direction = Util.getDirectionByText(l[1]);
                    statement.count = parseInt(l[2]);
                } else {
                    if(l[0] == "回転") {
                        statement = new RotateStatement();
                        statement.direction = Util.getDirectionByText(l[1]);
                    } else {
                        if(l[0] == "攻撃") {
                            statement = new AttackStatement();
                            statement.count = parseInt(l[1]);
                        }
                    }
                }
            }
            if(s.fail_step > 1) {
                statement.failStep = s.fail_step;
            }
            return statement;
        }
        Util.routineCompile = function routineCompile(s) {
            var lines = Util.splitText(s);
            var routine = new Routine();
            var new_lines = [];
            var parent = null;
            for(var i = 0; i < lines.length; i++) {
                if(!parent) {
                    parent = {
                        tab: Util.countTab(lines[i]),
                        text: lines[i],
                        fail_step: 1
                    };
                }
                var row = {
                    tab: Util.countTab(lines[i]),
                    text: lines[i],
                    fail_step: 1
                };
                if(parent.tab < row.tab) {
                    parent.fail_step++;
                } else {
                    parent = row;
                }
                new_lines.push(row);
            }
            for(var i = 0; i < new_lines.length; i++) {
                var statement = Util.statementCompile(new_lines[i]);
                routine.statements.push(statement);
            }
            return routine;
        }
        Util.getAngleByDirection = function getAngleByDirection(angle, direction) {
            switch(direction) {
                case Direction.Forward: {
                    return angle;
                    break;

                }
                case Direction.Right: {
                    switch(angle) {
                        case Angle.up: {
                            return Angle.right;

                        }
                        case Angle.down: {
                            return Angle.left;

                        }
                        case Angle.right: {
                            return Angle.down;

                        }
                        case Angle.left: {
                            return Angle.up;

                        }
                    }
                    break;

                }
                case Direction.Left: {
                    switch(angle) {
                        case Angle.up: {
                            return Angle.left;

                        }
                        case Angle.down: {
                            return Angle.right;

                        }
                        case Angle.right: {
                            return Angle.up;

                        }
                        case Angle.left: {
                            return Angle.down;

                        }
                    }
                    break;

                }
                case Direction.Back: {
                    switch(angle) {
                        case Angle.up: {
                            return Angle.down;

                        }
                        case Angle.down: {
                            return Angle.up;

                        }
                        case Angle.right: {
                            return Angle.left;

                        }
                        case Angle.left: {
                            return Angle.right;

                        }
                    }
                    break;

                }
            }
        }
        Util.getAngleString = function getAngleString(angle) {
            switch(angle) {
                case Angle.up: {
                    return "Up";

                }
                case Angle.down: {
                    return "Down";

                }
                case Angle.left: {
                    return "Left";

                }
                case Angle.right: {
                    return "Right";

                }
            }
        }
        Util.getDirectionString = function getDirectionString(direction) {
            switch(direction) {
                case Direction.Forward: {
                    return "Forward";

                }
                case Direction.Back: {
                    return "Back";

                }
                case Direction.Left: {
                    return "Left";

                }
                case Direction.Right: {
                    return "Right";

                }
            }
        }
        Util.getRandomDirection = function getRandomDirection() {
            var r = Math.floor(Math.random() * 100);
            if(r < 25) {
                return Direction.Forward;
            } else {
                if(r < 50) {
                    return Direction.Back;
                } else {
                    if(r < 75) {
                        return Direction.Right;
                    } else {
                        return Direction.Left;
                    }
                }
            }
        }
        return Util;
    })();
    Ai.Util = Util;    
})(Ai || (Ai = {}));
