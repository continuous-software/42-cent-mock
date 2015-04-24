var BaseGateway = require('42-cent-base').BaseGateway;
var P = require('bluebird');
var util = require('util');
var instance;

var methods = Object.keys(BaseGateway.prototype);

function MockGateway (options) {
  this.stubs = [];
  BaseGateway.call(this, options);
}

util.inherits(MockGateway, BaseGateway);

function factory (options) {
  //forcing singleton
  if (!instance) {
    instance = new MockGateway(options);
  }
  return instance;
}

methods.forEach(function (meth) {
  MockGateway.prototype[meth] = function () {
    var args = [].slice.call(arguments);
    var stub = this.stubs.filter(function (st) {
      return meth === st.method;
    });

    if (stub.length === 0) {
      throw new Error('Unexpected call of gateway ' + meth + ' with ' + JSON.stringify((args)));
    }

    stub = stub[0];

    if (!stub.resolveValue && !stub.rejectValue) {
      throw new Error('Unhandled call to the stub of ' + stub.method);
    }

    stub.calls.push(args);

    return stub.resolveValue ? P.resolve(stub.resolveValue) : P.rejectValue(stub.rejectValue);
  }
});

exports.factory = factory;

exports.clean = function clean () {
  factory().stubs = [];
};

function Stub (method) {
  this.calls = [];
  this.method = method;
}

Stub.prototype.rejectWith = function rejectWith (value) {
  this.rejectValue = value;
  return this;
};

Stub.prototype.resolveWith = function resolveWith (value) {
  this.resolveValue = value;
  return this;
};

exports.when = function when (method) {

  var stub;
  var matching;

  if (method.indexOf(method) === -1) {
    throw new Error(method, ' is not part of gateway implementation');
  }

  matching = factory().stubs.filter(function (st) {
    return st.method === method;
  });
  while (matching.length > 0) {
    factory().stubs.splice(factory().stubs.indexOf(matching.pop()), 1);
  }
  stub = new Stub(method);
  factory().stubs.push(stub);

  return stub;
};




