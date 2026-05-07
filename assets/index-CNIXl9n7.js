function qe(f,a){for(var p=0;p<a.length;p++){const o=a[p];if(typeof o!="string"&&!Array.isArray(o)){for(const r in o)if(r!=="default"&&!(r in f)){const d=Object.getOwnPropertyDescriptor(o,r);d&&Object.defineProperty(f,r,d.get?d:{enumerable:!0,get:()=>o[r]})}}}return Object.freeze(Object.defineProperty(f,Symbol.toStringTag,{value:"Module"}))}function _e(f){return f&&f.__esModule&&Object.prototype.hasOwnProperty.call(f,"default")?f.default:f}var R={exports:{}},k={exports:{}},K,ie;function xe(){return ie||(ie=1,K=function(a){return a===0?"x":a===1?"y":a===2?"z":"c"+(a+1)}),K}var Y,ae;function O(){if(ae)return Y;ae=1;const f=xe();return Y=function(p){return o;function o(r,d){let v=d&&d.indent||0,g=d&&d.join!==void 0?d.join:`
`,e=Array(v+1).join(" "),s=[];for(let t=0;t<p;++t){let b=f(t),y=t===0?"":e;s.push(y+r.replace(/{var}/g,b))}return s.join(g)}},Y}var de;function Fe(){if(de)return k.exports;de=1;const f=O();k.exports=a,k.exports.generateCreateBodyFunctionBody=p,k.exports.getVectorCode=r,k.exports.getBodyCode=o;function a(d,v){let g=p(d,v),{Body:e}=new Function(g)();return e}function p(d,v){return`
${r(d,v)}
${o(d)}
return {Body: Body, Vector: Vector};
`}function o(d){let v=f(d),g=v("{var}",{join:", "});return`
function Body(${g}) {
  this.isPinned = false;
  this.pos = new Vector(${g});
  this.force = new Vector();
  this.velocity = new Vector();
  this.mass = 1;

  this.springCount = 0;
  this.springLength = 0;
}

Body.prototype.reset = function() {
  this.force.reset();
  this.springCount = 0;
  this.springLength = 0;
}

Body.prototype.setPosition = function (${g}) {
  ${v("this.pos.{var} = {var} || 0;",{indent:2})}
};`}function r(d,v){let g=f(d),e="";return v&&(e=`${g(`
	   var v{var};
	Object.defineProperty(this, '{var}', {
	  set: function(v) { 
	    if (!Number.isFinite(v)) throw new Error('Cannot set non-numbers to {var}');
	    v{var} = v; 
	  },
	  get: function() { return v{var}; }
	});`)}`),`function Vector(${g("{var}",{join:", "})}) {
  ${e}
    if (typeof arguments[0] === 'object') {
      // could be another vector
      let v = arguments[0];
      ${g('if (!Number.isFinite(v.{var})) throw new Error("Expected value is not a finite number at Vector constructor ({var})");',{indent:4})}
      ${g("this.{var} = v.{var};",{indent:4})}
    } else {
      ${g('this.{var} = typeof {var} === "number" ? {var} : 0;',{indent:4})}
    }
  }
  
  Vector.prototype.reset = function () {
    ${g("this.{var} = ",{join:""})}0;
  };`}return k.exports}var S={exports:{}},se;function Se(){if(se)return S.exports;se=1;const f=O(),a=xe();S.exports=p,S.exports.generateQuadTreeFunctionBody=o,S.exports.getInsertStackCode=e,S.exports.getQuadNodeCode=g,S.exports.isSamePosition=r,S.exports.getChildBodyCode=v,S.exports.setChildBodyCode=d;function p(s){let t=o(s);return new Function(t)()}function o(s){let t=f(s),b=Math.pow(2,s);return`
${e()}
${g(s)}
${r(s)}
${v(s)}
${d(s)}

function createQuadTree(options, random) {
  options = options || {};
  options.gravity = typeof options.gravity === 'number' ? options.gravity : -1;
  options.theta = typeof options.theta === 'number' ? options.theta : 0.8;

  var gravity = options.gravity;
  var updateQueue = [];
  var insertStack = new InsertStack();
  var theta = options.theta;

  var nodesCache = [];
  var currentInCache = 0;
  var root = newNode();

  return {
    insertBodies: insertBodies,

    /**
     * Gets root node if it is present
     */
    getRoot: function() {
      return root;
    },

    updateBodyForce: update,

    options: function(newOptions) {
      if (newOptions) {
        if (typeof newOptions.gravity === 'number') {
          gravity = newOptions.gravity;
        }
        if (typeof newOptions.theta === 'number') {
          theta = newOptions.theta;
        }

        return this;
      }

      return {
        gravity: gravity,
        theta: theta
      };
    }
  };

  function newNode() {
    // To avoid pressure on GC we reuse nodes.
    var node = nodesCache[currentInCache];
    if (node) {
${x("      node.")}
      node.body = null;
      node.mass = ${t("node.mass_{var} = ",{join:""})}0;
      ${t("node.min_{var} = node.max_{var} = ",{join:""})}0;
    } else {
      node = new QuadNode();
      nodesCache[currentInCache] = node;
    }

    ++currentInCache;
    return node;
  }

  function update(sourceBody) {
    var queue = updateQueue;
    var v;
    ${t("var d{var};",{indent:4})}
    var r; 
    ${t("var f{var} = 0;",{indent:4})}
    var queueLength = 1;
    var shiftIdx = 0;
    var pushIdx = 1;

    queue[0] = root;

    while (queueLength) {
      var node = queue[shiftIdx];
      var body = node.body;

      queueLength -= 1;
      shiftIdx += 1;
      var differentBody = (body !== sourceBody);
      if (body && differentBody) {
        // If the current node is a leaf node (and it is not source body),
        // calculate the force exerted by the current node on body, and add this
        // amount to body's net force.
        ${t("d{var} = body.pos.{var} - sourceBody.pos.{var};",{indent:8})}
        r = Math.sqrt(${t("d{var} * d{var}",{join:" + "})});

        if (r === 0) {
          // Poor man's protection against zero distance.
          ${t("d{var} = (random.nextDouble() - 0.5) / 50;",{indent:10})}
          r = Math.sqrt(${t("d{var} * d{var}",{join:" + "})});
        }

        // This is standard gravitation force calculation but we divide
        // by r^3 to save two operations when normalizing force vector.
        v = gravity * body.mass * sourceBody.mass / (r * r * r);
        ${t("f{var} += v * d{var};",{indent:8})}
      } else if (differentBody) {
        // Otherwise, calculate the ratio s / r,  where s is the width of the region
        // represented by the internal node, and r is the distance between the body
        // and the node's center-of-mass
        ${t("d{var} = node.mass_{var} / node.mass - sourceBody.pos.{var};",{indent:8})}
        r = Math.sqrt(${t("d{var} * d{var}",{join:" + "})});

        if (r === 0) {
          // Sorry about code duplication. I don't want to create many functions
          // right away. Just want to see performance first.
          ${t("d{var} = (random.nextDouble() - 0.5) / 50;",{indent:10})}
          r = Math.sqrt(${t("d{var} * d{var}",{join:" + "})});
        }
        // If s / r < θ, treat this internal node as a single body, and calculate the
        // force it exerts on sourceBody, and add this amount to sourceBody's net force.
        if ((node.max_${a(0)} - node.min_${a(0)}) / r < theta) {
          // in the if statement above we consider node's width only
          // because the region was made into square during tree creation.
          // Thus there is no difference between using width or height.
          v = gravity * node.mass * sourceBody.mass / (r * r * r);
          ${t("f{var} += v * d{var};",{indent:10})}
        } else {
          // Otherwise, run the procedure recursively on each of the current node's children.

          // I intentionally unfolded this loop, to save several CPU cycles.
${h()}
        }
      }
    }

    ${t("sourceBody.force.{var} += f{var};",{indent:4})}
  }

  function insertBodies(bodies) {
    ${t("var {var}min = Number.MAX_VALUE;",{indent:4})}
    ${t("var {var}max = Number.MIN_VALUE;",{indent:4})}
    var i = bodies.length;

    // To reduce quad tree depth we are looking for exact bounding box of all particles.
    while (i--) {
      var pos = bodies[i].pos;
      ${t("if (pos.{var} < {var}min) {var}min = pos.{var};",{indent:6})}
      ${t("if (pos.{var} > {var}max) {var}max = pos.{var};",{indent:6})}
    }

    // Makes the bounds square.
    var maxSideLength = -Infinity;
    ${t("if ({var}max - {var}min > maxSideLength) maxSideLength = {var}max - {var}min ;",{indent:4})}

    currentInCache = 0;
    root = newNode();
    ${t("root.min_{var} = {var}min;",{indent:4})}
    ${t("root.max_{var} = {var}min + maxSideLength;",{indent:4})}

    i = bodies.length - 1;
    if (i >= 0) {
      root.body = bodies[i];
    }
    while (i--) {
      insert(bodies[i], root);
    }
  }

  function insert(newBody) {
    insertStack.reset();
    insertStack.push(root, newBody);

    while (!insertStack.isEmpty()) {
      var stackItem = insertStack.pop();
      var node = stackItem.node;
      var body = stackItem.body;

      if (!node.body) {
        // This is internal node. Update the total mass of the node and center-of-mass.
        ${t("var {var} = body.pos.{var};",{indent:8})}
        node.mass += body.mass;
        ${t("node.mass_{var} += body.mass * {var};",{indent:8})}

        // Recursively insert the body in the appropriate quadrant.
        // But first find the appropriate quadrant.
        var quadIdx = 0; // Assume we are in the 0's quad.
        ${t("var min_{var} = node.min_{var};",{indent:8})}
        ${t("var max_{var} = (min_{var} + node.max_{var}) / 2;",{indent:8})}

${l(8)}

        var child = getChild(node, quadIdx);

        if (!child) {
          // The node is internal but this quadrant is not taken. Add
          // subnode to it.
          child = newNode();
          ${t("child.min_{var} = min_{var};",{indent:10})}
          ${t("child.max_{var} = max_{var};",{indent:10})}
          child.body = body;

          setChild(node, quadIdx, child);
        } else {
          // continue searching in this quadrant.
          insertStack.push(child, body);
        }
      } else {
        // We are trying to add to the leaf node.
        // We have to convert current leaf into internal node
        // and continue adding two nodes.
        var oldBody = node.body;
        node.body = null; // internal nodes do not cary bodies

        if (isSamePosition(oldBody.pos, body.pos)) {
          // Prevent infinite subdivision by bumping one node
          // anywhere in this quadrant
          var retriesCount = 3;
          do {
            var offset = random.nextDouble();
            ${t("var d{var} = (node.max_{var} - node.min_{var}) * offset;",{indent:12})}

            ${t("oldBody.pos.{var} = node.min_{var} + d{var};",{indent:12})}
            retriesCount -= 1;
            // Make sure we don't bump it out of the box. If we do, next iteration should fix it
          } while (retriesCount > 0 && isSamePosition(oldBody.pos, body.pos));

          if (retriesCount === 0 && isSamePosition(oldBody.pos, body.pos)) {
            // This is very bad, we ran out of precision.
            // if we do not return from the method we'll get into
            // infinite loop here. So we sacrifice correctness of layout, and keep the app running
            // Next layout iteration should get larger bounding box in the first step and fix this
            return;
          }
        }
        // Next iteration should subdivide node further.
        insertStack.push(node, oldBody);
        insertStack.push(node, body);
      }
    }
  }
}
return createQuadTree;

`;function l(w){let B=[],C=Array(w+1).join(" ");for(let _=0;_<s;++_)B.push(C+`if (${a(_)} > max_${a(_)}) {`),B.push(C+`  quadIdx = quadIdx + ${Math.pow(2,_)};`),B.push(C+`  min_${a(_)} = max_${a(_)};`),B.push(C+`  max_${a(_)} = node.max_${a(_)};`),B.push(C+"}");return B.join(`
`)}function h(){let w=Array(11).join(" "),B=[];for(let C=0;C<b;++C)B.push(w+`if (node.quad${C}) {`),B.push(w+`  queue[pushIdx] = node.quad${C};`),B.push(w+"  queueLength += 1;"),B.push(w+"  pushIdx += 1;"),B.push(w+"}");return B.join(`
`)}function x(w){let B=[];for(let C=0;C<b;++C)B.push(`${w}quad${C} = null;`);return B.join(`
`)}}function r(s){let t=f(s);return`
  function isSamePosition(point1, point2) {
    ${t("var d{var} = Math.abs(point1.{var} - point2.{var});",{indent:2})}
  
    return ${t("d{var} < 1e-8",{join:" && "})};
  }  
`}function d(s){var t=Math.pow(2,s);return`
function setChild(node, idx, child) {
  ${b()}
}`;function b(){let y=[];for(let l=0;l<t;++l){let h=l===0?"  ":"  else ";y.push(`${h}if (idx === ${l}) node.quad${l} = child;`)}return y.join(`
`)}}function v(s){return`function getChild(node, idx) {
${t()}
  return null;
}`;function t(){let b=[],y=Math.pow(2,s);for(let l=0;l<y;++l)b.push(`  if (idx === ${l}) return node.quad${l};`);return b.join(`
`)}}function g(s){let t=f(s),b=Math.pow(2,s);var y=`
function QuadNode() {
  // body stored inside this node. In quad tree only leaf nodes (by construction)
  // contain bodies:
  this.body = null;

  // Child nodes are stored in quads. Each quad is presented by number:
  // 0 | 1
  // -----
  // 2 | 3
${l("  this.")}

  // Total mass of current node
  this.mass = 0;

  // Center of mass coordinates
  ${t("this.mass_{var} = 0;",{indent:2})}

  // bounding box coordinates
  ${t("this.min_{var} = 0;",{indent:2})}
  ${t("this.max_{var} = 0;",{indent:2})}
}
`;return y;function l(h){let x=[];for(let w=0;w<b;++w)x.push(`${h}quad${w} = null;`);return x.join(`
`)}}function e(){return`
/**
 * Our implementation of QuadTree is non-recursive to avoid GC hit
 * This data structure represent stack of elements
 * which we are trying to insert into quad tree.
 */
function InsertStack () {
    this.stack = [];
    this.popIdx = 0;
}

InsertStack.prototype = {
    isEmpty: function() {
        return this.popIdx === 0;
    },
    push: function (node, body) {
        var item = this.stack[this.popIdx];
        if (!item) {
            // we are trying to avoid memory pressure: create new element
            // only when absolutely necessary
            this.stack[this.popIdx] = new InsertStackElement(node, body);
        } else {
            item.node = node;
            item.body = body;
        }
        ++this.popIdx;
    },
    pop: function () {
        if (this.popIdx > 0) {
            return this.stack[--this.popIdx];
        }
    },
    reset: function () {
        this.popIdx = 0;
    }
};

function InsertStackElement(node, body) {
    this.node = node; // QuadTree node
    this.body = body; // physical body which needs to be inserted to node
}
`}return S.exports}var V={exports:{}},ue;function Pe(){if(ue)return V.exports;ue=1,V.exports=a,V.exports.generateFunctionBody=p;const f=O();function a(o){let r=p(o);return new Function("bodies","settings","random",r)}function p(o){let r=f(o);return`
  var boundingBox = {
    ${r("min_{var}: 0, max_{var}: 0,",{indent:4})}
  };

  return {
    box: boundingBox,

    update: updateBoundingBox,

    reset: resetBoundingBox,

    getBestNewPosition: function (neighbors) {
      var ${r("base_{var} = 0",{join:", "})};

      if (neighbors.length) {
        for (var i = 0; i < neighbors.length; ++i) {
          let neighborPos = neighbors[i].pos;
          ${r("base_{var} += neighborPos.{var};",{indent:10})}
        }

        ${r("base_{var} /= neighbors.length;",{indent:8})}
      } else {
        ${r("base_{var} = (boundingBox.min_{var} + boundingBox.max_{var}) / 2;",{indent:8})}
      }

      var springLength = settings.springLength;
      return {
        ${r("{var}: base_{var} + (random.nextDouble() - 0.5) * springLength,",{indent:8})}
      };
    }
  };

  function updateBoundingBox() {
    var i = bodies.length;
    if (i === 0) return; // No bodies - no borders.

    ${r("var max_{var} = -Infinity;",{indent:4})}
    ${r("var min_{var} = Infinity;",{indent:4})}

    while(i--) {
      // this is O(n), it could be done faster with quadtree, if we check the root node bounds
      var bodyPos = bodies[i].pos;
      ${r("if (bodyPos.{var} < min_{var}) min_{var} = bodyPos.{var};",{indent:6})}
      ${r("if (bodyPos.{var} > max_{var}) max_{var} = bodyPos.{var};",{indent:6})}
    }

    ${r("boundingBox.min_{var} = min_{var};",{indent:4})}
    ${r("boundingBox.max_{var} = max_{var};",{indent:4})}
  }

  function resetBoundingBox() {
    ${r("boundingBox.min_{var} = boundingBox.max_{var} = 0;",{indent:4})}
  }
`}return V.exports}var A={exports:{}},fe;function Ie(){if(fe)return A.exports;fe=1;const f=O();A.exports=a,A.exports.generateCreateDragForceFunctionBody=p;function a(o){let r=p(o);return new Function("options",r)}function p(o){return`
  if (!Number.isFinite(options.dragCoefficient)) throw new Error('dragCoefficient is not a finite number');

  return {
    update: function(body) {
      ${f(o)("body.force.{var} -= options.dragCoefficient * body.velocity.{var};",{indent:6})}
    }
  };
`}return A.exports}var W={exports:{}},ce;function Ne(){if(ce)return W.exports;ce=1;const f=O();W.exports=a,W.exports.generateCreateSpringForceFunctionBody=p;function a(o){let r=p(o);return new Function("options","random",r)}function p(o){let r=f(o);return`
  if (!Number.isFinite(options.springCoefficient)) throw new Error('Spring coefficient is not a number');
  if (!Number.isFinite(options.springLength)) throw new Error('Spring length is not a number');

  return {
    /**
     * Updates forces acting on a spring
     */
    update: function (spring) {
      var body1 = spring.from;
      var body2 = spring.to;
      var length = spring.length < 0 ? options.springLength : spring.length;
      ${r("var d{var} = body2.pos.{var} - body1.pos.{var};",{indent:6})}
      var r = Math.sqrt(${r("d{var} * d{var}",{join:" + "})});

      if (r === 0) {
        ${r("d{var} = (random.nextDouble() - 0.5) / 50;",{indent:8})}
        r = Math.sqrt(${r("d{var} * d{var}",{join:" + "})});
      }

      var d = r - length;
      var coefficient = ((spring.coefficient > 0) ? spring.coefficient : options.springCoefficient) * d / r;

      ${r("body1.force.{var} += coefficient * d{var}",{indent:6})};
      body1.springCount += 1;
      body1.springLength += r;

      ${r("body2.force.{var} -= coefficient * d{var}",{indent:6})};
      body2.springCount += 1;
      body2.springLength += r;
    }
  };
`}return W.exports}var U={exports:{}},ve;function Me(){if(ve)return U.exports;ve=1;const f=O();U.exports=a,U.exports.generateIntegratorFunctionBody=p;function a(o){let r=p(o);return new Function("bodies","timeStep","adaptiveTimeStepWeight",r)}function p(o){let r=f(o);return`
  var length = bodies.length;
  if (length === 0) return 0;

  ${r("var d{var} = 0, t{var} = 0;",{indent:2})}

  for (var i = 0; i < length; ++i) {
    var body = bodies[i];
    if (body.isPinned) continue;

    if (adaptiveTimeStepWeight && body.springCount) {
      timeStep = (adaptiveTimeStepWeight * body.springLength/body.springCount);
    }

    var coeff = timeStep / body.mass;

    ${r("body.velocity.{var} += coeff * body.force.{var};",{indent:4})}
    ${r("var v{var} = body.velocity.{var};",{indent:4})}
    var v = Math.sqrt(${r("v{var} * v{var}",{join:" + "})});

    if (v > 1) {
      // We normalize it so that we move within timeStep range. 
      // for the case when v <= 1 - we let velocity to fade out.
      ${r("body.velocity.{var} = v{var} / v;",{indent:6})}
    }

    ${r("d{var} = timeStep * body.velocity.{var};",{indent:4})}

    ${r("body.pos.{var} += d{var};",{indent:4})}

    ${r("t{var} += Math.abs(d{var});",{indent:4})}
  }

  return (${r("t{var} * t{var}",{join:" + "})})/length;
`}return U.exports}var Z,pe;function je(){if(pe)return Z;pe=1,Z=f;function f(a,p,o,r){this.from=a,this.to=p,this.length=o,this.coefficient=r}return Z}var ee,he;function Ee(){if(he)return ee;he=1,ee=f;function f(a,p){var o;if(a||(a={}),p){for(o in p)if(p.hasOwnProperty(o)){var r=a.hasOwnProperty(o),d=typeof p[o],v=!r||typeof a[o]!==d;v?a[o]=p[o]:d==="object"&&(a[o]=f(a[o],p[o]))}}return a}return ee}var te,le;function we(){if(le)return te;le=1;function f(o){p(o);const r=a(o);return o.on=r.on,o.off=r.off,o.fire=r.fire,o}function a(o){let r=Object.create(null);return{on:function(d,v,g){if(typeof v!="function")throw new Error("callback is expected to be a function");let e=r[d];return e||(e=r[d]=[]),e.push({callback:v,ctx:g}),o},off:function(d,v){if(typeof d>"u")return r=Object.create(null),o;if(r[d])if(typeof v!="function")delete r[d];else{const g=r[d];for(let e=0;e<g.length;++e)g[e].callback===v&&g.splice(e,1)}return o},fire:function(d){const v=r[d];if(!v)return o;let g;arguments.length>1&&(g=Array.prototype.slice.call(arguments,1));for(let e=0;e<v.length;++e){const s=v[e];s.callback.apply(s.ctx,g)}return o}}}function p(o){if(!o)throw new Error("Eventify cannot use falsy object as events subject");const r=["on","fire","off"];for(let d=0;d<r.length;++d)if(o.hasOwnProperty(r[d]))throw new Error("Subject cannot be eventified, since it already has property '"+r[d]+"'")}return te=f,te}var Q={exports:{}},ge;function Te(){if(ge)return Q.exports;ge=1,Q.exports=f,Q.exports.random=f,Q.exports.randomIterator=g;function f(e){var s=typeof e=="number"?e:+new Date;return new a(s)}function a(e){this.seed=e}a.prototype.next=v,a.prototype.nextDouble=d,a.prototype.uniform=d,a.prototype.gaussian=p,a.prototype.random=d;function p(){var e,s,t;do s=this.nextDouble()*2-1,t=this.nextDouble()*2-1,e=s*s+t*t;while(e>=1||e===0);return s*Math.sqrt(-2*Math.log(e)/e)}a.prototype.levy=o;function o(){var e=1.5,s=Math.pow(r(1+e)*Math.sin(Math.PI*e/2)/(r((1+e)/2)*e*Math.pow(2,(e-1)/2)),1/e);return this.gaussian()*s/Math.pow(Math.abs(this.gaussian()),1/e)}function r(e){return Math.sqrt(2*Math.PI/e)*Math.pow(1/Math.E*(e+1/(12*e-1/(10*e))),e)}function d(){var e=this.seed;return e=e+2127912214+(e<<12)&4294967295,e=(e^3345072700^e>>>19)&4294967295,e=e+374761393+(e<<5)&4294967295,e=(e+3550635116^e<<9)&4294967295,e=e+4251993797+(e<<3)&4294967295,e=(e^3042594569^e>>>16)&4294967295,this.seed=e,(e&268435455)/268435456}function v(e){return Math.floor(this.nextDouble()*e)}function g(e,s){var t=s||f();if(typeof t.next!="function")throw new Error("customRandom does not match expected API: next() function is missing");return{forEach:y,shuffle:b};function b(){var l,h,x;for(l=e.length-1;l>0;--l)h=t.next(l+1),x=e[h],e[h]=e[l],e[l]=x;return e}function y(l){var h,x,w;for(h=e.length-1;h>0;--h)x=t.next(h+1),w=e[x],e[x]=e[h],e[h]=w,l(w);e.length&&l(e[0])}}return Q.exports}var re,ye;function be(){if(ye)return re;ye=1,re=g;var f=Fe(),a=Se(),p=Pe(),o=Ie(),r=Ne(),d=Me(),v={};function g(t){var b=je(),y=Ee(),l=we();if(t){if(t.springCoeff!==void 0)throw new Error("springCoeff was renamed to springCoefficient");if(t.dragCoeff!==void 0)throw new Error("dragCoeff was renamed to dragCoefficient")}t=y(t,{springLength:10,springCoefficient:.8,gravity:-12,theta:.8,dragCoefficient:.9,timeStep:.5,adaptiveTimeStepWeight:0,dimensions:2,debug:!1});var h=v[t.dimensions];if(!h){var x=t.dimensions;h={Body:f(x,t.debug),createQuadTree:a(x),createBounds:p(x),createDragForce:o(x),createSpringForce:r(x),integrate:d(x)},v[x]=h}var w=h.Body,B=h.createQuadTree,C=h.createBounds,_=h.createDragForce,z=h.createSpringForce,G=h.integrate,J=u=>new w(u),P=Te().random(42),q=[],F=[],I=B(t,P),T=C(q,t,P),N=z(t,P),X=_(t),L=0,M=[],j=new Map,n=0;$("nbody",$e),$("spring",Ce);var i={bodies:q,quadTree:I,springs:F,settings:t,addForce:$,removeForce:E,getForces:D,step:function(){for(var u=0;u<M.length;++u)M[u](n);var m=G(q,t.timeStep,t.adaptiveTimeStepWeight);return n+=1,m},addBody:function(u){if(!u)throw new Error("Body is required");return q.push(u),u},addBodyAt:function(u){if(!u)throw new Error("Body position is required");var m=J(u);return q.push(m),m},removeBody:function(u){if(u){var m=q.indexOf(u);if(!(m<0))return q.splice(m,1),q.length===0&&T.reset(),!0}},addSpring:function(u,m,H,ne){if(!u||!m)throw new Error("Cannot add null spring to force simulator");typeof H!="number"&&(H=-1);var oe=new b(u,m,H,ne>=0?ne:-1);return F.push(oe),oe},getTotalMovement:function(){return L},removeSpring:function(u){if(u){var m=F.indexOf(u);if(m>-1)return F.splice(m,1),!0}},getBestNewBodyPosition:function(u){return T.getBestNewPosition(u)},getBBox:c,getBoundingBox:c,invalidateBBox:function(){console.warn("invalidateBBox() is deprecated, bounds always recomputed on `getBBox()` call")},gravity:function(u){return u!==void 0?(t.gravity=u,I.options({gravity:u}),this):t.gravity},theta:function(u){return u!==void 0?(t.theta=u,I.options({theta:u}),this):t.theta},random:P};return e(t,i),l(i),i;function c(){return T.update(),T.box}function $(u,m){if(j.has(u))throw new Error("Force "+u+" is already added");j.set(u,m),M.push(m)}function E(u){var m=M.indexOf(j.get(u));m<0||(M.splice(m,1),j.delete(u))}function D(){return j}function $e(){if(q.length!==0){I.insertBodies(q);for(var u=q.length;u--;){var m=q[u];m.isPinned||(m.reset(),I.updateBodyForce(m),X.update(m))}}}function Ce(){for(var u=F.length;u--;)N.update(F[u])}}function e(t,b){for(var y in t)s(t,b,y)}function s(t,b,y){if(t.hasOwnProperty(y)&&typeof b[y]!="function"){var l=Number.isFinite(t[y]);l?b[y]=function(h){if(h!==void 0){if(!Number.isFinite(h))throw new Error("Value of "+y+" should be a valid number.");return t[y]=h,b}return t[y]}:b[y]=function(h){return h!==void 0?(t[y]=h,b):t[y]}}}return re}var me;function Le(){if(me)return R.exports;me=1,R.exports=a,R.exports.simulator=be();var f=we();function a(o,r){if(!o)throw new Error("Graph structure cannot be undefined");var d=r&&r.createSimulator||be(),v=d(r);if(Array.isArray(r))throw new Error("Physics settings is expected to be an object");var g=o.version>19?j:M;r&&typeof r.nodeMass=="function"&&(g=r.nodeMass);var e=new Map,s={},t=0,b=v.settings.springTransform||p;J(),_();var y=!1,l={step:function(){if(t===0)return h(!0),!0;var n=v.step();l.lastMove=n,l.fire("step");var i=n/t,c=i<=.01;return h(c),c},getNodePosition:function(n){return L(n).pos},setNodePosition:function(n){var i=L(n);i.setPosition.apply(i,Array.prototype.slice.call(arguments,1))},getLinkPosition:function(n){var i=s[n];if(i)return{from:i.from.pos,to:i.to.pos}},getGraphRect:function(){return v.getBBox()},forEachBody:x,pinNode:function(n,i){var c=L(n.id);c.isPinned=!!i},isNodePinned:function(n){return L(n.id).isPinned},dispose:function(){o.off("changed",G),l.fire("disposed")},getBody:C,getSpring:B,getForceVectorLength:w,simulator:v,graph:o,lastMove:0};return f(l),l;function h(n){y!==n&&(y=n,z(n))}function x(n){e.forEach(n)}function w(){var n=0,i=0;return x(function(c){n+=Math.abs(c.force.x),i+=Math.abs(c.force.y)}),Math.sqrt(n*n+i*i)}function B(n,i){var c;if(i===void 0)typeof n!="object"?c=n:c=n.id;else{var $=o.hasLink(n,i);if(!$)return;c=$.id}return s[c]}function C(n){return e.get(n)}function _(){o.on("changed",G)}function z(n){l.fire("stable",n)}function G(n){for(var i=0;i<n.length;++i){var c=n[i];c.changeType==="add"?(c.node&&P(c.node.id),c.link&&F(c.link)):c.changeType==="remove"&&(c.node&&q(c.node),c.link&&I(c.link))}t=o.getNodesCount()}function J(){t=0,o.forEachNode(function(n){P(n.id),t+=1}),o.forEachLink(F)}function P(n){var i=e.get(n);if(!i){var c=o.getNode(n);if(!c)throw new Error("initBody() was called with unknown node id");var $=c.position;if(!$){var E=T(c);$=v.getBestNewBodyPosition(E)}i=v.addBodyAt($),i.id=n,e.set(n,i),N(n),X(c)&&(i.isPinned=!0)}}function q(n){var i=n.id,c=e.get(i);c&&(e.delete(i),v.removeBody(c))}function F(n){N(n.fromId),N(n.toId);var i=e.get(n.fromId),c=e.get(n.toId),$=v.addSpring(i,c,n.length);b(n,$),s[n.id]=$}function I(n){var i=s[n.id];if(i){var c=o.getNode(n.fromId),$=o.getNode(n.toId);c&&N(c.id),$&&N($.id),delete s[n.id],v.removeSpring(i)}}function T(n){var i=[];if(!n.links)return i;for(var c=Math.min(n.links.length,2),$=0;$<c;++$){var E=n.links[$],D=E.fromId!==n.id?e.get(E.fromId):e.get(E.toId);D&&D.pos&&i.push(D)}return i}function N(n){var i=e.get(n);if(i.mass=g(n),Number.isNaN(i.mass))throw new Error("Node mass should be a number")}function X(n){return n&&(n.isPinned||n.data&&n.data.isPinned)}function L(n){var i=e.get(n);return i||(P(n),i=e.get(n)),i}function M(n){var i=o.getLinks(n);return i?1+i.length/3:1}function j(n){var i=o.getLinks(n);return i?1+i.size/3:1}}function p(){}return R.exports}var Be=Le();const ke=_e(Be),Oe=qe({__proto__:null,default:ke},[Be]);export{ke as c,Oe as i};
