# reactor-framework
very fast reactive MVVM framework

demo: http://spat-ne-hochu.github.io/reactor-framework/

## cold start

##### 1. You need template (html)
```html
<div class="tplOne row">
  <div class="model">
    <input class="text-field"> <!-- this node would be two-way databinding -->
  </div>
  
  <div class="operator">*</div>
  
  <div class="cell">
    <button class="button">+</button> <!-- this button should increase the next number -->
    <div class="monitor">1</div>  <!-- this binding number -->
    <button class="button">-</button> <!-- this button should decrease the previous number -->
  </div>
  
  <div class="operator">=</div>
  
  <div class="sum"></div> <!-- this binding sum -->
</div>
```

##### 2 You need model(controller)
```javascript
rc.controller('ExampleController', function() {
    this.number = null;
    this.sum    = null;
    this.base   = 1;

    this.inc = function() {
        this.number++;
    };

    this.dec = function() {
        this.number = this.number - 1;
    };

    this.calcSum = function() {
        this.sum = this.number * this.base;
    }
});
```

##### 3. You need binding scheme (~json)

> in the future the binding will also be in the dom, 
  hello angular!

```javascript
var bindingOne = [
    {
        selector  : '.cell > button:first-child',
        directive : 'click',
        path      : 'inc'
    },
    {
        selector  : '.cell > button:last-child',
        directive : 'click',
        path      : 'dec'
    },
    {
        selector  : '.cell > .monitor',
        directive : 'bind',
        path      : 'number'
    },
    {
        selector  : '.sum',
        directive : 'bind',
        path      : 'sum'
    },
    {
        selector  : '.text-field',
        directive : '<=>',
        path      : 'base'
    }
];
```

##### 4. And run it!
```javascript
rc.getControllerInstance('ExampleController').bind('.tplOne', bindingOne);
```

##### 5. Show demo
http://spat-ne-hochu.github.io/reactor-framework/
