
 angular.module('cosmic.controllers', [])
 
.controller('browseCtrl', 
				['$scope', '$ionicLoading', 'SoundCloudQuery', 'Utils', '$stateParams', '$ionicModal', '$moment',
function( $scope,   $ionicLoading,   SoundCloudQuery,   Utils ,  $stateParams ,  $ionicModal,   $moment ) {
	var idle 	= false;
	var query;



	$scope.searchByTag = function(tag){
		$ionicLoading.show();
	  query = SoundCloudQuery.query( { tags: tag } );

	  query.getNextPage().then(function(results){
			$scope.results =  results;
  		$ionicLoading.hide();
  		$scope.showList = true;
  	});  
	}

	/**
	 * Loads more results
	 * @return {[type]}
	 */
	$scope.loadMore = function(){	
		return query.getNextPage().then(function(results){
			$scope.results = $scope.results ? $scope.results.concat(results) : results;
			return results;
		});  
		
	};

	function init(){
		$ionicLoading.show();
		if($stateParams.tag){
			$scope.showList = true;
			//if I have the tag..
			$scope.title = $stateParams.tag;
			$scope.searchByTag($stateParams.tag.toLowerCase());	
		}else{
			$scope.title = 'Browse';
			$scope.showList = false;
			query = SoundCloudQuery.query({});
			query.getNextPage().then(function(results){
				$scope.tags =  Utils.filterTags(results);;
		 		$ionicLoading.hide();
	 		});	
		}
	}

	init();
}])
   
.controller('searchCloudCtrl', ['$scope', '$ionicLoading', 'SoundCloudQuery', '$ionicModal', '$moment', 'KeyboardService',
function( $scope,   $ionicLoading,   SoundCloudQuery,   $ionicModal,   $moment ,  KeyboardService ) {
	
	var query;
	//$scope.query = {};
	//init the controller
	init();
	
	/**
	 * init
	 * @return {[type]} [description]
	 */
	function init(){
	

	  // Create the login modal that we will use later
	  $ionicModal.fromTemplateUrl('templates/info.html', {
	    scope: $scope
	  }).then(function(modal) {
	    $scope.modal = modal;
	  });
	}

	/**
	 * Clearing query
	 * @return {[type]} [description]
	 */
	$scope.clearQuery = function(){
		$scope.query.value = null;
	}

	/**
	 * Search action
	 * @param  {[type]} so [description]
	 * @return {[type]}    [description]
	 */
	$scope.search = function(so){
		KeyboardService.hide();
		$ionicLoading.show();
	  query =  SoundCloudQuery.query({q:so.query});
		query.getNextPage().then(function(results){
			$scope.results = results;
  		$ionicLoading.hide();
  	});    
	};

	/**
	 * Loads more results
	 * @return {[type]}
	 */
	$scope.loadMore = function(){	
		return query.getNextPage().then(function(results){
			$scope.results = $scope.results ? $scope.results.concat(results) : results;
			return results;
		});  
		
	};



}])
   
.controller('shareCtrl', function($scope) {

});
 
