$(function(){
	var cortex = new Cortex();

	// Event handler for when a middleware or route
	// handler throws an exception
	cortex.on('error', function(err, route){
		console.log('error');
		console.log(err);
		console.log(err.stack);
	});

	// Event for post-route handling.
	// This will only fire when `next()` is called in the
	// last handler in the chain and the route stack is of 
	// length 0
	cortex.on('afterRoute', function(route){
		console.log('after everything', route);
	});

	// Define a middleware that will be used before every route
	cortex.use(function(route, next){
		route.data.someValue = 'test';
		next();
	});

	// Define a route
	cortex.route('test/:token(/:optionalParam)', function(route, next){
		next();
	});

	cortex.route('otherTest', {
		optionData: 'stuff'
	}, function(route, next){
		console.log('middleware 1');
		next();
	}, function(route, next){
		console.log('middleware 2');
		next();
	}, function(route, next){
		console.log('other test handler');
		next();
	});

	// initialize your Backbone app
	var app = Backbone.Router.extend({
		routes: cortex.getRoutes(),
		initialize: function(){
			console.log('app init');
		}
	});

	new app();
	Backbone.history.start({ pushState: true });
});