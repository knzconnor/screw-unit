Screw.Unit(function() {
    
    describe("TH.insertDomMock", function () {
        before(function () {
            TH.insertDomMock("dom_mock_test")
        });
        
        it("should add the file to the DOM", function () {
            expect(jQuery("#dom_test")).to(contain_selector, ".dom_mock");
        });
    });
    
    describe("TH.click", function () {
        var clickReceived;
        before(function () {
            clickReceived = false;
            TH.insertDomMock("click_test");
            jQuery("#click_tester").bind("click", function () {
                clickReceived = true;
            });
        });
        
        it("should fire the browser click event", function () {
            TH.click(jQuery("#click_tester")[0]);
            expect(clickReceived).to(be_true);
        });        
    });
    
    describe("TH.Ajax", function () {
        var response;
        before(function () {
            TH.Ajax.mock("/a_url", "someText", 200);
        });
        
        it("should send the response you added to the onComplete function", function () {
            var ajx = new Ajax.Request("/a_url", {
                onComplete: function (resp) { response = resp }
            });
            expect(response.responseText).to(equal, "someText");
        });
        
        it("should send the response you added to the onSuccess function when the response is a 200", function () {
            var ajx = new Ajax.Request("/a_url", {
                onSuccess: function (resp) { response = resp }
            });
            expect(response.responseText).to(equal, "someText");
        });
        
        it("should send the response to onFailure when the response is not a 200", function () {
            TH.Ajax.mock("/a_url", "someText", 400);
            var ajx = new Ajax.Request("/a_url", {
                onFailure: function (resp) { response = resp }
            });
            expect(response.responseText).to(equal, "someText");
        });
        
        it("should raise when you call an unmocked ajax url", function () {
            var raised = false;
            try {
                var ajx = new Ajax.Request("/a_different_url");
            } catch (e) {
                raised = true;
            }
            expect(raised).to(be_true);
        });
        
        it("(will fail without prototype) should do responseJSON when the response is JSON", function () {
            TH.Ajax.mock("/a_url", "{'foo': 'bar'}", 200);
            var ajx = new Ajax.Request("/a_url", {
                onComplete: function (resp) { response = resp }
            });
            console.dir(response);
            console.dir(eval(response.responseText));
            expect(response.responseJSON.foo).to(equal, 'bar');
        });
        
    });
    
    describe('TH.Mock', function() {
        
        // global scope
        simpleObject = {
            property: 'a property',
            func: function (arg) {
                return arg;
            },
            anotherFunction: function (arg) {
                return arg;
            }
        };
        
        // global scope
        complexObject = (function () {
            var publicObj = {};

            var privateProperty = 'privateProperty';

            var privateFunction = function (arg) {
                return arg;
            };

            publicObj.publicFunction = function () {
                return privateFunction('privateFunctionWorked');
            };

            publicObj.publicProperty = "publicProperty";

            return publicObj;
        })();
        
        describe('mocking a function', function () {
            it("should keep the unmocked functions", function () {
               TH.Mock.obj("simpleObject");
               expect(simpleObject.anotherFunction('arbitrary')).to(equal, 'arbitrary'); 
            });
            
            describe('with a simple object', function () {
               it("should replace the function", function () {
                  TH.Mock.obj("simpleObject", {
                      func: function () {
                          return "functionMocked";
                      }
                  });
                  expect(simpleObject.func()).to(equal, "functionMocked");
               });
               
               it("should restore the function after tests", function () {
                   expect(simpleObject.func('arbitrary')).to(equal, 'arbitrary');
               });
               
            });
            
            describe('with a complex object', function () {
               it("should replace the function", function () {
                  TH.Mock.obj("complexObject", {
                      publicFunction: function () {
                          return "functionMocked";
                      }
                  });
                  expect(complexObject.publicFunction()).to(equal, "functionMocked");
               });
               
               it("should restore thre function after tests", function () {
                   expect(complexObject.publicFunction()).to(equal, 'privateFunctionWorked');
               });
               
            });
            
            
        });
        
        describe('counting calls to a function (without executing it)', function () {
            
            it("should look up calls from an object without needing the object", function () {
                var mockedSimpleObj = TH.Mock.obj("simpleObject");
                mockedSimpleObj.countCallsOf("func");
                simpleObject.func();
                
                expect(TH.Mock.numberOfCallsTo('simpleObject', 'func')).to(equal, 1);
            });
            
            describe("with a simple object", function () {
               var mockedSimpleObj;
               
               it("should count 1 call", function () {
                   mockedSimpleObj = TH.Mock.obj("simpleObject");
                   mockedSimpleObj.countCallsOf("func");
                   simpleObject.func();
                   expect(mockedSimpleObj.numberOfCallsTo("func")).to(equal, 1);
               });
               
               it("should count more than 1 call", function () {
                   mockedSimpleObj = TH.Mock.obj("simpleObject");
                   mockedSimpleObj.countCallsOf("func");
                   simpleObject.func();
                   simpleObject.func();
                   expect(mockedSimpleObj.numberOfCallsTo("func")).to(equal, 2);
               });
               
               it("should restore the function after the test is run", function () {
                    expect(simpleObject.func('arbitrary')).to(equal, 'arbitrary');
               });
               
            });
            
            describe("with a complex object", function () {
               var mockedObj;
               it("should count 1 call", function () {
                   mockedObj = TH.Mock.obj("complexObject");
                   mockedObj.countCallsOf("publicFunction");
                   complexObject.publicFunction();
                   expect(mockedObj.numberOfCallsTo("publicFunction")).to(equal, 1);
               });
               
               it("should count more than 1 call", function () {
                   mockedObj = TH.Mock.obj("complexObject");
                   mockedObj.countCallsOf("publicFunction");
                   complexObject.publicFunction();
                   complexObject.publicFunction();
                   expect(mockedObj.numberOfCallsTo("publicFunction")).to(equal, 2);
               });
               
               it("should restore the function after the test is run", function () {
                    expect(complexObject.publicFunction()).to(equal, 'privateFunctionWorked');
               });
               
            });
            
            
        });
        
    });
});
