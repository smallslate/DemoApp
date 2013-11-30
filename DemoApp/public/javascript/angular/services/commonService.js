angular.module('commonService', [ 'ngResource' ])

	.factory('getAllCategoriesService',[ '$resource', function($resource) {
			return $resource('/getAllCategories', {}, {
				query : {method : 'GET',isArray : true}
			});
		} ])
	
	.factory('getCategoryByIdService', [ '$resource', function($resource) {
		return $resource('/getCategoryById', {}, {
			query : {method : 'GET'}
		});
	}])
	
	.factory('getSubCategoryByIdService', [ '$resource', function($resource) {
		return $resource('/getSubCategoryById', {}, {
			query : {method : 'GET'}
		});
	}])
	
	.factory('getSubCategoriesByCategoryCodeService', [ '$resource', function($resource) {
		return $resource('/getSubCategoriesByCategoryCode', {}, {
			query : {method : 'GET',isArray : true}
		});
	}])
	
	.factory('getSubCategoriesByExamCodeService', [ '$resource', function($resource) {
		return $resource('/getSubCategoriesByExamCode', {}, {
			query : {method : 'GET',isArray : true}
		});
	}])
	
	.factory('getAllCatAndSubCat', [ '$resource', function($resource) {
			return $resource('/getAllCatAndSubCat', {}, {
				query : {method : 'GET',isArray : true}
			});
	}])

	.factory('search', ['$resource', function($resource) {
		return $resource('/search', {}, {
			query : {method : 'POST',isArray : true}
		});
	}]);