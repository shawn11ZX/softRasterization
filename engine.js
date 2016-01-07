/// <reference path="test.ts"/>
var Vector4 = (function () {
    function Vector4(x, y, z, w) {
        if (x === void 0) { x = 0; }
        if (y === void 0) { y = 0; }
        if (z === void 0) { z = 0; }
        if (w === void 0) { w = 1; }
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    Vector4.prototype.add = function (right) {
        return new Vector4(this.x + right.x, this.y + right.y, this.z + right.z);
    };
    Vector4.prototype.sub = function (right) {
        return new Vector4(this.x - right.x, this.y - right.y, this.z - right.z);
    };
    Vector4.prototype.multi = function (right) {
        return new Vector4(this.x * right, this.y * right, this.z * right);
    };
    Vector4.prototype.cross = function (right) {
        return new Vector4(this.y * right.z - this.z * right.y, this.z * right.x - this.x * right.z, this.x * right.y - this.y * right.x);
    };
    Vector4.prototype.length = function () {
        return Math.sqrt(this.dot(this));
    };
    Vector4.prototype.dot = function (right) {
        return this.x * right.x + this.y * right.y + this.z * right.z;
    };
    Vector4.prototype.normalize = function () {
        var len = this.length();
        return new Vector4(this.x / len, this.y / len, this.z / len);
    };
    Vector4.prototype.clip = function () {
        return new Vector4(this.x / this.w, this.y / this.w, this.z / this.w, 1);
    };
    Vector4.prototype.transform = function (m) {
        var x = this.x * m.get(0, 0) + this.y * m.get(1, 0) + this.z * m.get(2, 0) + this.w * m.get(3, 0);
        var y = this.x * m.get(0, 1) + this.y * m.get(1, 1) + this.z * m.get(2, 1) + this.w * m.get(3, 1);
        var z = this.x * m.get(0, 2) + this.y * m.get(1, 2) + this.z * m.get(2, 2) + this.w * m.get(3, 2);
        var w = this.x * m.get(0, 3) + this.y * m.get(1, 3) + this.z * m.get(2, 3) + this.w * m.get(3, 3);
        return new Vector4(x, y, z, w);
    };
    return Vector4;
})();
var Matrix44 = (function () {
    function Matrix44() {
        /** column major */
        this.data = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        this.data[0] = 1;
        this.data[5] = 1;
        this.data[10] = 1;
        this.data[15] = 1;
    }
    Matrix44.prototype.set = function (column, row, value) {
        this.data[column * 4 + row] = value;
    };
    Matrix44.prototype.get = function (column, row) {
        return this.data[column * 4 + row];
    };
    Matrix44.prototype.setColumn = function (column, v) {
        this.data[column * 4 + 0] = v.x;
        this.data[column * 4 + 1] = v.y;
        this.data[column * 4 + 2] = v.z;
        this.data[column * 4 + 3] = v.w;
    };
    Matrix44.prototype.transpose = function () {
        for (var c = 0; c < 4; c++) {
            for (var r = c; r < 4; r++) {
                var t = this.data[c * 4 + r];
                this.data[c * 4 + r] = this.data[r * 4 + c];
                this.data[r * 4 + c] = t;
            }
        }
    };
    Matrix44.prototype.scale = function (x, y, z) {
        this.set(0, 0, this.get(0, 0) * x);
        this.set(1, 1, this.get(1, 1) * y);
        this.set(2, 2, this.get(2, 2) * z);
    };
    Matrix44.createRotateY = function (angle) {
        var m = new Matrix44();
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        m.set(0, 0, cos);
        m.set(0, 2, -1 * sin);
        m.set(2, 0, sin);
        m.set(2, 2, cos);
        return m;
    };
    return Matrix44;
})();
var Vertex3D = (function () {
    function Vertex3D(position, color, uv) {
        if (position === void 0) { position = new Vector4(); }
        if (color === void 0) { color = new Vector4(); }
        if (uv === void 0) { uv = new Vector4(); }
        this.position = position;
        this.color = color;
        this.uv = uv;
    }
    Object.defineProperty(Vertex3D.prototype, "x", {
        get: function () { return this.position.x; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex3D.prototype, "y", {
        get: function () { return this.position.y; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex3D.prototype, "z", {
        get: function () { return this.position.z; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Vertex3D.prototype, "w", {
        get: function () { return this.position.w; },
        enumerable: true,
        configurable: true
    });
    return Vertex3D;
})();
var Camera3D = (function () {
    function Camera3D(screen, fov, aspectRation, near, far) {
        var _this = this;
        this.screen = screen;
        var d = Math.tan(fov / 2);
        this.view2Clipping = new Matrix44();
        this.view2Clipping.set(0, 0, d / aspectRation);
        this.view2Clipping.set(1, 1, d);
        this.view2Clipping.set(2, 2, (far + near) / (near - far));
        this.view2Clipping.set(2, 3, -1);
        this.view2Clipping.set(3, 2, 2 * near * far / (near - far));
        this.view2Clipping.set(3, 3, 0);
        window.addWheelListener(screen.canvas, function (e) { return _this.onZoom(e); });
    }
    Camera3D.prototype.onZoom = function (event) {
        var length = this.target.sub(this.position).length();
        this.position = this.target.add(this.position.sub(this.target).multi((length + event.deltaY / 10) / length));
        this.lookAt(this.position, this.target, this.up);
        console.log(length);
    };
    Camera3D.prototype.lookAt = function (position, target, up) {
        this.position = position;
        this.target = target;
        this.up = up;
        var dir = target.sub(position);
        var right = dir.cross(up);
        var y = right.cross(dir);
        var v2w = new Matrix44();
        v2w.setColumn(0, right.normalize());
        v2w.setColumn(1, y.normalize());
        v2w.setColumn(2, dir.normalize().multi(-1));
        v2w.transpose();
        var translate = position.transform(v2w).multi(-1);
        v2w.setColumn(3, translate);
        this.world2View = v2w;
    };
    return Camera3D;
})();
var RenderMode;
(function (RenderMode) {
    RenderMode[RenderMode["Color"] = 0] = "Color";
    RenderMode[RenderMode["Texture"] = 1] = "Texture";
    RenderMode[RenderMode["Wireframe"] = 2] = "Wireframe";
})(RenderMode || (RenderMode = {}));
var Screen3D = (function () {
    function Screen3D(width, height) {
        this.ndc2screen = new Matrix44();
        this.ndc2screen.set(0, 0, width / 2);
        this.ndc2screen.set(1, 1, -height / 2);
        this.ndc2screen.set(2, 2, 1 / 2);
        this.ndc2screen.set(3, 0, width / 2);
        this.ndc2screen.set(3, 1, height / 2);
        this.ndc2screen.set(3, 2, 1 / 2);
        this.canvas = document.createElement("canvas");
        this.canvas.width = width;
        this.canvas.height = height;
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext("2d");
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    Screen3D.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    Screen3D.prototype.round = function (n) {
        if (n - Math.floor(n) > 0.5)
            n = Math.floor(n) + 1;
        else
            n = Math.floor(n);
        return n;
    };
    Screen3D.prototype.rasterizeHalf = function (startY, endY, leftTop, leftBtm, rightTop, rightBtm, mode, texture) {
        for (var y = startY; y < endY; y++) {
            var t1 = (y - leftTop.y) / (leftBtm.y - leftTop.y);
            var t2 = (y - rightTop.y) / (rightBtm.y - rightTop.y);
            if (t1 < 0)
                t1 = 0;
            if (t2 < 0)
                t2 = 0;
            /**
             * 不取整会导致波纹效果
             */
            var sx = leftTop.x + t1 * (leftBtm.x - leftTop.x);
            var ex = rightTop.x + t2 * (rightBtm.x - rightTop.x);
            var csByZs;
            var ceByZe;
            if (mode == RenderMode.Color) {
                csByZs = leftTop.color.multi((1 - t1) / leftTop.w).add(leftBtm.color.multi(t1 / leftBtm.w));
                ceByZe = rightTop.color.multi((1 - t2) / rightTop.w).add(rightBtm.color.multi(t2 / rightBtm.w));
            }
            else if (mode == RenderMode.Texture) {
                csByZs = leftTop.uv.multi((1 - t1) / leftTop.w).add(leftBtm.uv.multi(t1 / leftBtm.w));
                ceByZe = rightTop.uv.multi((1 - t2) / rightTop.w).add(rightBtm.uv.multi(t2 / rightBtm.w));
            }
            var recipZs = (1 - t1) / leftTop.w + t1 / leftBtm.w;
            var recipZe = (1 - t2) / rightTop.w + t2 / rightBtm.w;
            var roundsx = Math.round(sx);
            var roundex = Math.round(ex);
            var diffX = ex - sx;
            for (var x = roundsx; x < roundex; x++) {
                var t3 = (x - sx) / diffX;
                if (t3 < 0)
                    t3 = 0;
                var recipZm = (1 - t3) * recipZs + t3 * recipZe;
                var cmByzm = csByZs.multi((1 - t3) * recipZs).add(ceByZe.multi(t3 * recipZe));
                var cm = cmByzm.multi(1 / recipZm);
                /**
                 * rgb里必须是整数
                 */
                if (mode == RenderMode.Color) {
                    this.ctx.fillStyle = "rgb(" + Math.min(255, Math.ceil(cm.x)) + ", " + Math.min(255, Math.ceil(cm.y)) + ", " + Math.min(255, Math.ceil(cm.z)) + ")";
                }
                else {
                    var color = texture.pick(cm.x, cm.y);
                    this.ctx.fillStyle = "rgb(" + color.x + ", " + color.y + ", " + color.z + ")";
                }
                this.ctx.fillRect(x, y, 1, 1);
            }
        }
    };
    /**
     * Given three points with:
    * - position in screen space
    * - color same as original
    * Draw the triangle
    */
    Screen3D.prototype.rasterize = function (p1, p2, p3, mode, texture) {
        if (texture === void 0) { texture = null; }
        this.ctx.fillStyle = "rgb(255,255,255)";
        this.ctx.fillRect(p1.x, p1.y, 2, 2);
        this.ctx.fillRect(p2.x, p2.y, 2, 2);
        this.ctx.fillRect(p3.x, p3.y, 2, 2);
        var vertexArray = [p1, p2, p3];
        vertexArray.sort(function (a, b) { return a.position.y - b.position.y; });
        var pa = vertexArray[0];
        var pb = vertexArray[1];
        var pc = vertexArray[2];
        var diffYup = Math.ceil(pb.y - pa.y);
        /**
         * Y/X会导致不统一，换成X/Y
         */
        var gradientBC = (pc.x - pb.x) / (pc.y - pb.y);
        var gradientAB = (pb.x - pa.x) / (pb.y - pa.y);
        var gradientAC = (pc.x - pa.x) / (pc.y - pa.y);
        var roundAy = Math.round(pa.y);
        var roundBy = Math.round(pb.y);
        var roundCy = Math.round(pc.y);
        if (gradientAC < gradientAB) {
            this.rasterizeHalf(roundAy, roundBy, pa, pc, pa, pb, mode, texture);
        }
        else {
            this.rasterizeHalf(roundAy, roundBy, pa, pb, pa, pc, mode, texture);
        }
        if (gradientBC < gradientAC) {
            this.rasterizeHalf(roundBy, roundCy, pa, pc, pb, pc, mode, texture);
        }
        else {
            this.rasterizeHalf(roundBy, roundCy, pb, pc, pa, pc, mode, texture);
        }
    };
    return Screen3D;
})();
var Object3D = (function () {
    function Object3D(geometry, texture) {
        this.geometry = geometry;
        this.matrix = new Matrix44();
        this.texture = texture;
    }
    return Object3D;
})();
var CubeGeometry = (function () {
    function CubeGeometry() {
        this.vertexArray = new Array();
        this.indexArray = new Array();
        this.vertexArray.push(new Vertex3D(new Vector4(-1, 1, 1), new Vector4(255, 0, 0), new Vector4(0, 0, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(1, 1, 1), new Vector4(0, 255, 0), new Vector4(1, 0, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(-1, -1, 1), new Vector4(0, 0, 255), new Vector4(0, 1, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(1, -1, 1), new Vector4(255, 255, 255), new Vector4(1, 1, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(-1, 1, -1), new Vector4(255, 0, 0), new Vector4(1, 0, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(1, 1, -1), new Vector4(255, 0, 0), new Vector4(0, 0, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(-1, -1, -1), new Vector4(0, 255, 0), new Vector4(1, 1, 0)));
        this.vertexArray.push(new Vertex3D(new Vector4(1, -1, -1), new Vector4(0, 255, 0), new Vector4(0, 1, 0)));
        // 前
        this.indexArray.push(0, 2, 3);
        this.indexArray.push(0, 3, 1);
        // 右
        this.indexArray.push(1, 3, 7);
        this.indexArray.push(1, 7, 5);
        // 后
        this.indexArray.push(5, 7, 6);
        this.indexArray.push(5, 6, 4);
        // 左
        this.indexArray.push(4, 6, 2);
        this.indexArray.push(4, 2, 0);
        // 上
        this.indexArray.push(4, 0, 1);
        this.indexArray.push(4, 1, 5);
        // 下
        this.indexArray.push(3, 2, 6);
        this.indexArray.push(3, 6, 7);
    }
    return CubeGeometry;
})();
/*
 * Y is up
 */
var SphericalCoodinate = (function () {
    function SphericalCoodinate() {
    }
    SphericalCoodinate.prototype.fromCartesian = function (v) {
        this.length = v.length();
        this.theta = Math.atan2(v.z, v.x);
        this.phy = Math.atan2(Math.sqrt(v.x * v.x + v.z * v.z), v.y);
    };
    SphericalCoodinate.prototype.toCartesian = function () {
        var r = this.length * Math.sin(this.phy);
        var y = this.length * Math.cos(this.phy);
        var x = r * Math.cos(this.theta);
        var z = r * Math.sin(this.theta);
        var v = new Vector4(x, y, z);
        return v;
    };
    return SphericalCoodinate;
})();
var Texture3D = (function () {
    function Texture3D(width, height, src) {
        var _this = this;
        if (src === void 0) { src = null; }
        this.height = height;
        this.width = width;
        this.img = new Image(width, height);
        if (src != null) {
            this.img.onload = function (ev) { return _this.onLoadImage(ev); };
            this.img.src = src;
        }
        else {
            this.loaded = true;
            this.rawData = new Array();
            for (var j = 0; j < width; j++) {
                for (var i = 0; i < height; i++) {
                    var x = i / 32;
                    var y = j / 32;
                    var offset = 4 * (j * this.width + i);
                    if (((x + y) & 1) == 1) {
                        this.rawData[offset + 0] = 0x3f;
                        this.rawData[offset + 1] = 0xbc;
                        this.rawData[offset + 2] = 0xef;
                    }
                    else {
                        this.rawData[offset + 0] = 0xff;
                        this.rawData[offset + 1] = 0xff;
                        this.rawData[offset + 2] = 0xff;
                    }
                }
            }
        }
    }
    Texture3D.prototype.pick = function (u, v) {
        if (this.loaded) {
            var row = Math.round(u * this.width);
            var col = Math.round(v * this.height);
            var offset = 4 * (row * this.width + col);
            return new Vector4(this.rawData[offset + 0], this.rawData[offset + 1], this.rawData[offset + 2]);
        }
        else {
            return new Vector4(255, 0, 0);
        }
    };
    Texture3D.prototype.onLoadImage = function (ev) {
        var tmp_canvas = document.createElement("canvas");
        tmp_canvas.width = this.width;
        tmp_canvas.height = this.height;
        var tmp_context = tmp_canvas.getContext('2d');
        tmp_context.drawImage(this.img, 0, 0);
        this.rawData = tmp_context.getImageData(0, 0, tmp_canvas.width, tmp_canvas.height).data;
        this.loaded = true;
    };
    return Texture3D;
})();
var Scene3D = (function () {
    function Scene3D() {
        this.objectArray = new Array();
    }
    Scene3D.prototype.setCamera = function (camera) {
        this.camera = camera;
    };
    Scene3D.prototype.setScreen = function (screen) {
        this.screen = screen;
    };
    Scene3D.prototype.addObject = function (obj) {
        this.objectArray.push(obj);
    };
    Scene3D.prototype.render = function (mode) {
        var _this = this;
        this.screen.clear();
        for (var o = 0; o < this.objectArray.length; o++) {
            var obj = this.objectArray[o];
            var triangleNum = obj.geometry.indexArray.length / 3;
            for (var i = 0; i < triangleNum; i++) {
                var i0 = obj.geometry.indexArray[i * 3 + 0];
                var i1 = obj.geometry.indexArray[i * 3 + 1];
                var i2 = obj.geometry.indexArray[i * 3 + 2];
                var pm0 = obj.geometry.vertexArray[i0];
                var pm1 = obj.geometry.vertexArray[i1];
                var pm2 = obj.geometry.vertexArray[i2];
                var pv0 = pm0.position.transform(obj.matrix).transform(this.camera.world2View);
                var pc0 = pv0.transform(this.camera.view2Clipping);
                var ps0 = pc0.clip().transform(this.screen.ndc2screen);
                var pv1 = pm1.position.transform(obj.matrix).transform(this.camera.world2View);
                var pc1 = pv1.transform(this.camera.view2Clipping);
                var ps1 = pc1.clip().transform(this.screen.ndc2screen);
                var pv2 = pm2.position.transform(obj.matrix).transform(this.camera.world2View);
                var pc2 = pv2.transform(this.camera.view2Clipping);
                var ps2 = pc2.clip().transform(this.screen.ndc2screen);
                ps0.w = pv0.w;
                ps1.w = pv1.w;
                ps2.w = pv2.w;
                var normal = pv0.sub(pv1).cross(pv0.sub(pv2));
                if (pv0.dot(normal) < 0) {
                    this.screen.rasterize(new Vertex3D(ps0, pm0.color, pm0.uv), new Vertex3D(ps1, pm1.color, pm1.uv), new Vertex3D(ps2, pm2.color, pm2.uv), mode, obj.texture);
                }
            }
        }
        requestAnimationFrame(function () { return _this.render(mode); });
    };
    Scene3D.prototype.start = function (mode) {
        var _this = this;
        requestAnimationFrame(function () { return _this.render(mode); });
        window.addEventListener("keypress", function (e) { return _this.onKeyDown(e); }, false);
    };
    Scene3D.prototype.onKeyDown = function (e) {
        //W
        if (e.charCode == 'w'.charCodeAt(0)) {
            var v = this.camera.position.sub(this.camera.target);
            var s = new SphericalCoodinate();
            s.fromCartesian(v);
            s.phy += -5 * 3.14 / 180;
            if (s.phy < 0)
                return;
            v = s.toCartesian();
            var newPosition = this.camera.target.add(v);
            this.camera.lookAt(newPosition, this.camera.target, this.camera.up);
        }
        // S
        if (e.charCode == 's'.charCodeAt(0)) {
            var v = this.camera.position.sub(this.camera.target);
            var s = new SphericalCoodinate();
            s.fromCartesian(v);
            s.phy += 5 * 3.14 / 180;
            if (s.phy > 3.14)
                return;
            v = s.toCartesian();
            var newPosition = this.camera.target.add(v);
            this.camera.lookAt(newPosition, this.camera.target, this.camera.up);
        }
        // A
        if (e.charCode == 'a'.charCodeAt(0)) {
            var m = Matrix44.createRotateY(-5 * 3.14 / 180);
            var newDir = this.camera.position.sub(this.camera.target).transform(m);
            var newPosition = this.camera.target.add(newDir);
            this.camera.lookAt(newPosition, this.camera.target, this.camera.up);
            console.log("5");
        }
        // D
        if (e.charCode == 'd'.charCodeAt(0)) {
            var m = Matrix44.createRotateY(5 * 3.14 / 180);
            var newDir = this.camera.position.sub(this.camera.target).transform(m);
            var newPosition = this.camera.target.add(newDir);
            this.camera.lookAt(newPosition, this.camera.target, this.camera.up);
            console.log("-5");
        }
    };
    return Scene3D;
})();
//# sourceMappingURL=engine.js.map