# 42-cent-mock
mock implementation of abstract 42-cent payement gateway to use for tests

## usage

* register the mock factory in place of whatever gateway, the factory will return a singleton instance of the mocked gateway

```Javascript
var cent42=require('42-cent');
var gm=require('42-cent-mock');

cent42.registerGateway('Authorize.net',gm.factory);

```

* stub call and make assertions on arguments
```Javascript
var stub = gm.when('refundTransaction').resolveWith({status:'success'});

gm.factory().refundTransaction('666',{amount:123});

assert.equal(stub.calls.length,1);
assert.equal(stub.calls[0][0], '666')
assert.equal(stub.calls[0][1].amount,123);
```
* clean the currently set stubs (tear down phase of your test)

```Javascript
gm.clean();
```
