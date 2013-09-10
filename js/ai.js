var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Ai;
(function (Ai) {
    (function (Operator) {
        Operator[Operator["Equal"] = 0] = "Equal";
        Operator[Operator["Over"] = 1] = "Over";
        Operator[Operator["Under"] = 2] = "Under";
        Operator[Operator["Not"] = 3] = "Not";
    })(Ai.Operator || (Ai.Operator = {}));
    var Operator = Ai.Operator;

    (function (Direction) {
        Direction[Direction["Forward"] = 0] = "Forward";
        Direction[Direction["Left"] = 1] = "Left";
        Direction[Direction["Right"] = 2] = "Right";
        Direction[Direction["Back"] = 3] = "Back";
        Direction[Direction["Enemy"] = 4] = "Enemy";
        Direction[Direction["Random"] = 5] = "Random";
        Direction[Direction["Road"] = 6] = "Road";
    })(Ai.Direction || (Ai.Direction = {}));
    var Direction = Ai.Direction;

    (function (ContactType) {
        ContactType[ContactType["Empty"] = 0] = "Empty";
        ContactType[ContactType["Enemy"] = 1] = "Enemy";
        ContactType[ContactType["Alliance"] = 2] = "Alliance";
        ContactType[ContactType["Road"] = 3] = "Road";
        ContactType[ContactType["Wall"] = 4] = "Wall";
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
            this.statements = [];
            this.index = 0;
            this.time = 0;
        }
        Routine.prototype.next = function (info) {
            var statement = this.statements[this.index];
            var action = statement.execute(info);
            if (this.debug) {
                var txt = [];
                txt.push(statement["constructor"]["name"]);
                txt.push(action ? action.name : "fail(" + statement.failStep + ")");
            }
            if (action) {
                if (!action.name) {
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
            this.contacts = {};
            this.directions = {};
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
            if (this.postReturn)
                routine.index = 0;
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
            if (this.direction == Direction.Enemy) {
                if (!info.directions[ContactType.Enemy])
                    return null;
                action.target = info.directions[ContactType.Enemy].direction;
            } else if (this.direction == Direction.Road) {
                if (!info.directions[ContactType.Road])
                    return null;
                action.target = info.directions[ContactType.Road].direction;
            } else if (this.direction == Direction.Random) {
                action.target = Util.getRandomDirection();
            } else {
                action.target = this.direction;
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
            if (this.check(info))
                return new Action();

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
            if (d == undefined)
                return false;
            if (d.direction != this.direction)
                return false;

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
        };
        return RandomConditionStatement;
    })(ConditionStatement);
    Ai.RandomConditionStatement = RandomConditionStatement;

    var Rader = (function () {
        function Rader(firstDirection, rotateDirection) {
            this.max = 100;
            this.offset = { x: 0, y: 0 };
            this.firstDirection = firstDirection;
            this.rotateDirection = rotateDirection;
            this.sequence = [];

            if (this.rotateDirection == Direction.Right) {
                this.sequence.push({ x: 0, y: -1, d: Direction.Forward });
                this.sequence.push({ x: 1, y: 0, d: Direction.Right });
                this.sequence.push({ x: 0, y: 1, d: Direction.Back });
                this.sequence.push({ x: -1, y: 0, d: Direction.Left });
            } else if (this.rotateDirection == Direction.Left) {
                this.sequence.push({ x: 0, y: -1, d: Direction.Forward });
                this.sequence.push({ x: -1, y: 0, d: Direction.Left });
                this.sequence.push({ x: 0, y: 1, d: Direction.Back });
                this.sequence.push({ x: 1, y: 0, d: Direction.Right });
            } else
                throw "Invalid rotateDirection. (Only right or left)";
            switch (this.firstDirection) {
                case Direction.Forward:
                    this.sequence.push({ x: 0, y: -1, d: Direction.Forward });
                    break;
                case Direction.Right:
                    if (this.rotateDirection == Direction.Right) {
                        this.sequence.push(this.sequence.shift());
                    } else {
                        this.sequence.push(this.sequence.shift());
                        this.sequence.push(this.sequence.shift());
                        this.sequence.push(this.sequence.shift());
                    }
                    this.sequence.push({ x: 1, y: 0, d: Direction.Right });
                    break;
                case Direction.Back:
                    this.sequence.push(this.sequence.shift());
                    this.sequence.push(this.sequence.shift());
                    this.sequence.push({ x: 0, y: 1, d: Direction.Back });
                    break;
                case Direction.Left:
                    if (this.rotateDirection == Direction.Right) {
                        this.sequence.push(this.sequence.shift());
                        this.sequence.push(this.sequence.shift());
                        this.sequence.push(this.sequence.shift());
                    } else {
                        this.sequence.push(this.sequence.shift());
                    }
                    this.sequence.push({ x: -1, y: 0, d: Direction.Left });
                    break;
            }
        }
        Rader.prototype.search = function (caller, callback) {
            var power = 1;
            var pos = { x: 0, y: 0 };

            if (callback.call(caller, {
                distance: 0,
                direction: Direction.Forward,
                x: this.offset.x,
                y: this.offset.y
            }) == false)
                return;

            do {
                var plen = power * 4;
                for (var i = 0; i < plen; i++) {
                    var j = i % power;
                    var k = Math.floor(i / power);
                    var l = power - j;

                    pos = {
                        x: Math.round(power * this.sequence[k].x * l / power + power * this.sequence[k + 1].x * j / power),
                        y: Math.round(power * this.sequence[k].y * l / power + power * this.sequence[k + 1].y * j / power)
                    };
                    if (callback.call(caller, {
                        distance: power,
                        direction: j > l ? this.sequence[k + 1].d : this.sequence[k].d,
                        x: pos.x + this.offset.x,
                        y: pos.y + this.offset.y
                    }) == false)
                        return;
                }
                power++;
            } while(power < this.max);
        };
        return Rader;
    })();
    Ai.Rader = Rader;

    var RotableMap = (function () {
        function RotableMap(map) {
            this.map = [];
            this.map[jg.Angle.Up] = map;
            this.map[jg.Angle.Down] = [];
            this.map[jg.Angle.Left] = [];
            this.map[jg.Angle.Right] = [];
            var w = map.length;
            var h = map[0].length;
            var m = Math.max(w, h);
            this.size = {
                w: w,
                h: h,
                m: m
            };
            var x2, y2;
            for (var x = 0; x < m; x++) {
                this.map[jg.Angle.Down][x] = [];
                this.map[jg.Angle.Left][x] = [];
                this.map[jg.Angle.Right][x] = [];

                for (var y = 0; y < m; y++) {
                    x2 = m - x - 1;
                    y2 = m - y - 1;
                    if (x2 < w && y2 < h && x2 >= 0 && y2 >= 0)
                        this.map[jg.Angle.Down][x][y] = map[x2][y2];
else
                        this.map[jg.Angle.Down][x][y] = false;

                    x2 = y;
                    y2 = m - x - 1;
                    if (x2 < w && y2 < h && x2 >= 0 && y2 >= 0)
                        this.map[jg.Angle.Left][x][y] = map[x2][y2];
else
                        this.map[jg.Angle.Left][x][y] = false;

                    x2 = m - y - 1;
                    y2 = x;
                    if (x2 < w && y2 < h && x2 >= 0 && y2 >= 0)
                        this.map[jg.Angle.Right][x][y] = map[x2][y2];
else
                        this.map[jg.Angle.Right][x][y] = false;
                }
            }
        }
        RotableMap.prototype.getPos = function (pos, angle) {
            switch (angle) {
                case jg.Angle.Up:
                    return pos;
                case jg.Angle.Right:
                    return {
                        x: pos.y,
                        y: this.size.m - pos.x - 1
                    };
                case jg.Angle.Down:
                    return {
                        x: this.size.m - pos.x - 1,
                        y: this.size.m - pos.y - 1
                    };
                case jg.Angle.Left:
                    return {
                        x: this.size.m - pos.y - 1,
                        y: pos.x
                    };
            }
            throw "invalid parameter";
        };

        RotableMap.prototype.get = function (x, y, angle) {
            if (x < 0 || y < 0 || x >= this.map[angle].length || y >= this.map[angle][0].length)
                return false;

            return this.map[angle][x][y];
        };
        return RotableMap;
    })();
    Ai.RotableMap = RotableMap;

    var BasicRaderHandler = (function () {
        function BasicRaderHandler(baseMap, chipSize) {
            this.baseMap = baseMap;
            this.map = new RotableMap(baseMap);
            this.info = new Information();
            this.chipSize = chipSize;
            if (!BasicRaderHandler.rader) {
                BasicRaderHandler.rader = new Rader(Direction.Forward, Direction.Right);
                BasicRaderHandler.rader.max = this.baseMap.length * 2;
            }
        }
        BasicRaderHandler.prototype.setCharacterInfo = function (chara, alliance_id, enemy_id) {
            this.chara = chara;
            this.alliance_id = alliance_id;
            this.enemy_id = enemy_id;
            BasicRaderHandler.rader.offset = this.map.getPos({
                x: Math.floor(this.chara.x / this.chipSize.width),
                y: Math.floor(this.chara.y / this.chipSize.height)
            }, this.chara.currentAngle);
            this.info = new Information(chara);
        };

        BasicRaderHandler.prototype.search = function () {
            BasicRaderHandler.rader.search(this, this.raderCallback);
            return this.info;
        };

        BasicRaderHandler.prototype.raderCallback = function (info) {
            var chip = this.map.get(info.x, info.y, this.chara.currentAngle);
            if (chip === false)
                return true;

            if (this.debug)
                this.map.map[this.chara.currentAngle][info.x][info.y].chip = -info.distance;

            if (info.distance <= 1) {
                for (var i = 0; i < chip.c.length; i++) {
                    if (chip.c[i] == this.chara || chip.c[i].is_dead)
                        continue;
                    var type = chip.c[i].team_id == this.alliance_id ? ContactType.Alliance : ContactType.Enemy;

                    if (this.info.contacts[info.direction] && this.info.contacts[info.direction].type != ContactType.Alliance) {
                        if (!this.info.directions[type]) {
                            this.info.directions[type] = { direction: info.direction, data: chip.c[i] };
                        }
                        continue;
                    }
                    var contact = {
                        data: chip.c[i],
                        type: type
                    };

                    this.info.contacts[info.direction] = contact;
                    if (!this.info.directions[type])
                        this.info.directions[type] = { direction: info.direction, data: chip.c[i] };
                }

                if (info.distance == 1 && !this.info.contacts[info.direction])
                    this.info.contacts[info.direction] = { data: null, type: ContactType.Road };

                return true;
            }

            if (this.info.directions[ContactType.Enemy])
                return false;

            for (var i = 0; i < chip.c.length; i++) {
                if (chip.c[i] == this.chara || chip.c[i].is_dead)
                    continue;
                if (chip.c[i].team_id == this.enemy_id) {
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
        function Util() {
        }
        Util.splitText = function (s) {
            var ret = [];
            var start = 0;
            for (var i = 0; i < s.length; i++) {
                var j = s.charCodeAt(i);
                if (j == 10 || j == 13) {
                    if (start != i)
                        ret.push(s.substr(start, i - start));
                    start = i + 1;
                }
            }
            return ret;
        };

        Util.countTab = function (s) {
            for (var i = 0; i < s.length; i++)
                if (s.charCodeAt(i) != 9)
                    return i;
            return 0;
        };

        Util.getDirectionByText = function (s) {
            switch (s) {
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
        };

        Util.getContactTypeByText = function (s) {
            switch (s) {
                case "敵":
                    return ContactType.Enemy;
                case "味方":
                    return ContactType.Alliance;
                case "道":
                    return ContactType.Road;
                case "壁":
                    return ContactType.Wall;
            }
        };

        Util.getOperatorByText = function (s) {
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
        };

        Util.statementCompile = function (s) {
            var markup = new RegExp("\\[([^\\]]+)\\]", "ig");
            var statementText = s.text.match(markup);
            var l = [];
            for (var i = 0; i < statementText.length; i++)
                l.push(statementText[i].substr(1, statementText[i].length - 2));

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
        };

        Util.routineCompile = function (s) {
            var lines = Util.splitText(s);
            var routine = new Routine();
            var new_lines = [];
            var parent = null;
            for (var i = 0; i < lines.length; i++) {
                if (!parent) {
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
                if (parent.tab < row.tab) {
                    parent.fail_step++;
                } else {
                    parent = row;
                }
                new_lines.push(row);
            }
            for (var i = 0; i < new_lines.length; i++) {
                var statement = Util.statementCompile(new_lines[i]);
                routine.statements.push(statement);
            }

            return routine;
        };

        Util.getAngleByDirection = function (angle, direction) {
            switch (direction) {
                case Direction.Forward:
                    return angle;
                    break;
                case Direction.Right:
                    switch (angle) {
                        case jg.Angle.Up:
                            return jg.Angle.Right;
                        case jg.Angle.Down:
                            return jg.Angle.Left;
                        case jg.Angle.Right:
                            return jg.Angle.Down;
                        case jg.Angle.Left:
                            return jg.Angle.Up;
                    }
                    break;
                case Direction.Left:
                    switch (angle) {
                        case jg.Angle.Up:
                            return jg.Angle.Left;
                        case jg.Angle.Down:
                            return jg.Angle.Right;
                        case jg.Angle.Right:
                            return jg.Angle.Up;
                        case jg.Angle.Left:
                            return jg.Angle.Down;
                    }
                    break;
                case Direction.Back:
                    switch (angle) {
                        case jg.Angle.Up:
                            return jg.Angle.Down;
                        case jg.Angle.Down:
                            return jg.Angle.Up;
                        case jg.Angle.Right:
                            return jg.Angle.Left;
                        case jg.Angle.Left:
                            return jg.Angle.Right;
                    }
                    break;
            }
        };

        Util.getAngleString = function (angle) {
            switch (angle) {
                case jg.Angle.Up:
                    return "Up";
                case jg.Angle.Down:
                    return "Down";
                case jg.Angle.Left:
                    return "Left";
                case jg.Angle.Right:
                    return "Right";
            }
        };

        Util.getDirectionString = function (direction) {
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
        };

        Util.getRandomDirection = function () {
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
        };
        return Util;
    })();
    Ai.Util = Util;
})(Ai || (Ai = {}));
