// Im a javascript file
(function(window, $, _){

	function Route(route, handlers, cortex){
		this.route = route;
		this.handlers = handlers;
		this.cortex = cortex;
	};

	Route.prototype.tokenizeQueryString = function(qs){
		qs = qs || '';

		if(!qs.length || (qs.length == 1 && qs[0] == '?')){
			return {};
		}

		qs = qs.replace(/^\?/, '');
		qs = qs.split('&');

		var params = {};
		_.reduce(qs, function(parms, param){
			param = param.split('=');

			params[param[0]] = param[1];
			return params;
		}, params);

		return params;
	};

	Route.prototype.tokenizeUrlParams = function(parameters){
		var params = {};
		parameters = _.filter(parameters, function(a){ return !!a; });

		var tokenNames = _.map(this.route.match(/(:[^\/]+)/g), function(r){
			return r.substring(1).replace(/[\(\)]/g, '');
		});

		_.reduce(tokenNames, function(params, token, index){
			params[token] = parameters[index] || undefined;
			return params;
		}, params);
		return params || {};
	};

	Route.prototype.getHandler = function(){
		var self = this;

		return function(){
			
			var routeStack = [].concat(self.cortex.getMiddlewares()).concat(self.handlers);

			if(!routeStack.length){
				return;
			}
			var args = _.values(arguments);

			var scope = {
				query: self.tokenizeQueryString(args.pop()),
				params: self.tokenizeUrlParams(args),
				Route: self,
				data: {}
			};

			var processNext = function(){
				if(!routeStack.length){
					return self.cortex.trigger('afterRoute', scope);
				}

				var current = routeStack.shift();

				if(typeof current !== 'function'){
					return;
				}
				try {
					current(scope, function(err){
						if(err){
							return self.cortex.trigger('error', err, scope, self);
						}
						processNext();
					});
				} catch(e){
					self.cortex.trigger('error', e, scope, self);
				}
			};
			processNext();
			
		};
	};

	Route.prototype.getRoute = function(){
		return this.route;
	};


	function Cortex(){
		this.middlewares = [];
		this.routes = [];
	};

	Cortex.prototype = Object.create(Backbone.Events);

	Cortex.prototype.use = function(fn){
		if(typeof fn === 'function'){
			this.middlewares.push(fn);
		}
	};

	Cortex.prototype.getMiddlewares = function(){
		return this.middlewares || [];
	};

	Cortex.prototype.route = function(route){
		var args = _.values(arguments);
		if(args.length < 2){
			return console.warn('Missing arguments; Cortex.route(route, fn)');
		}

		this.routes.push(new Route(route, args.slice(1), this));
	};

	Cortex.prototype.getRoutes = function(cb){
		var routes = {};

		_.reduce(this.routes, function(routes, r){
			routes[r.getRoute()] = r.getHandler();
			return routes;
		}, routes);
		return routes;
	};

	window.Cortex = Cortex;

})(window, jQuery, _);

