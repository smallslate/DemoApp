/* Controllers */

angular.module('ckEditorDirective', []).directive('ckEditor', [ function() {
	return {
		require : '?ngModel',
		link : function($scope, elm, attr, ngModel) {
			 var ck = CKEDITOR.replace(elm[0],{height:attr.ckEditor,enterMode:CKEDITOR.ENTER_DIV});
			 if(!ck || ck == undefined) {
				 alert("Rich editor may not be supported in your browser");
			 } else {
				 ck.on('instanceReady', function() {
                     ck.setData(ngModel.$viewValue);
                 });
				 ck.on('change', function() {
					$scope.$apply(function() {
						ngModel.$setViewValue(ck.getData());
				  });
				});
				ngModel.$render = function(value) {
					ck.setData(ngModel.$modelValue);
				};
			 }
		}
	};
}]);