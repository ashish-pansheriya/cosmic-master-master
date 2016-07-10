angular.module('cosmic.services').factory("cosmicConfig", function($q, $cordovaFile) {
    var config =  {
        appRootStorage  : cordova.file.externalApplicationStorageDirectory,
        appDataFolder   : cordova.file.applicationDirectory + 'www/data/',
        extensionsAudio : ['mp3','m4a']
    };

    // Directories init
    var path = config.appRootStorage;
    var dataPath = config.appDataFolder;
    var dirName = 'artworks';
    var dirName2 = 'tmp';
    var dirName3 = 'miniatures';
    console.log('Initialisation : '+ path);

    window.resolveLocalFileSystemURL(path, function (fileSystem) {
        fileSystem.getDirectory(dirName, {create : true, exclusive : false}, function (result) {
            console.log('Create folder : ' + dirName);
            fileSystem.getDirectory(dirName2, {create : true, exclusive : false}, function (result) {
                console.log('Create folder : ' + dirName2);
                fileSystem.getDirectory(dirName3, {create : true, exclusive : false}, function (result) {
                    console.log('Create folder : ' + dirName3);


                    $cordovaFile.copyFile(dataPath+'artworks/','default_artwork.jpg',path + 'artworks/','default_artwork.jpg').then(function(){
                        console.log('Copy default artwork');
                    });
                    $cordovaFile.copyFile(dataPath+'miniatures/','default_artwork.jpg',path + 'miniatures/','default_artwork.jpg').then(function(){
                        console.log('Copy default miniatures');
                    });


                    console.log('Success: File system init');
                }, function (error) {
                    console.log('Directory Initialisation failed : '+error);
                });
            }, function (error) {
                console.log('Directory Initialisation failed : '+error);
            });
        }, function (error) {
            console.log('Directory Initialisation failed : '+error);
        });
    }, function (error) {
        console.log('Directory Initialisation failed : '+error);
    });

    return config;
})
.factory('KeyboardService', ['Utils',
function( Utils ){

	/**
	 * public
	 */
	return {
	//	show : show,
		hide: hide
		//isVisible: isVisible,
	}

	/**
	 * Hide the native keyboard
	 * Shows console.info if not present..
	 * @todo  check if in device as well
	 */
	function hide(){
		if(pluginPresent()){
			cordova.plugins.Keyboard.close();
		}else{
			console.info("hiding the native keyboard");
		}
	}

	function pluginPresent(){
		return window.cordova && window.cordova.plugins &&  window.cordova.plugins.Keyboard;
	}


}])

.factory('SoundCloudQuery',
        ['SoundCloudService', '$q',
function( SoundCloudService ,  $q ) {

	var PAGE_SIZE= 50;


  /**
   * Constructor
   * @param {[type]}
   */
  function Query(options, serviceCall){
    this.options 	= options;
    this.serviceCall = serviceCall;
    this.limit = options.limit ? options.limit : PAGE_SIZE;
    this.pageNumber = 0;
  };


  /**
   * Gets next page of data
   * @return {Promise}
   */
  Query.prototype.getNextPage = function() {
    //set params
    var params  = {
      limit: this.limit,
      offset: (this.limit * this.pageNumber),
    }
    //add user if present
    if(this.options.user) {
      params.user = this.options.user
    }

    this.pageNumber = this.pageNumber + 1 ;
    //call service with params
    return this.serviceCall(angular.extend({},this.options,params));
  };


  /**
   * creates a new query
   * @param  {Object} options
   * @return {Query}
   */
  function newQuery (options) {
    options = options || {};
    return new Query(options, SoundCloudService.getTracks);
  };


  /**
   * creates a new query by user name
   * @param  {Object} options
   * @return {Query}
   */
  function newQueryByUser (options) {
    options = options || {};
    return new Query(options,  SoundCloudService.getTracksByUser);
  };


  /**
   * Public methods
   */
  return {
    query: newQuery,
    queryByUser: newQueryByUser
  }

}])
.factory('SoundCloudService',
	      ['$http', '$q', '$log' ,
function( $http,   $q , $log){


	/**
	 * public
	 */
	return {
		getTracks : getTracks,
		getTracksByUser: getTracksByUser
	}

	/**
	 * Get client ID
	 * @return {String}
	 * @todo this needs so be set on config
	 */
	function getClientId(){
		return 'a3c640eb93a579e2fb97438a287aff52';
	}



	/**
	Gets track
	@param {Object} options Filter options

	Parameter					Type					Description
	q									string				a string to search for (see search documentation)
	tags							list					a comma separated list of tags
	filter						enumeration		(all,public,private)
	license						enumeration		Filter on license. (see license attribute)
	bpm[from]					number				return tracks with at least this bpm value
	bpm[to]						number				return tracks with at most this bpm value
	duration[from]		number				return tracks with at least this duration (in millis)
	duration[to]			number				return tracks with at most this duration (in millis)
	created_at[from]	date					(yyyy-mm-dd hh:mm:ss) return tracks created at this date or later
	created_at[to]		date					(yyyy-mm-dd hh:mm:ss) return tracks created at this date or earlier
	ids								list					a comma separated list of track ids to filter on
	genres						list					a comma separated list of genres
	types							enumeration		a comma separated list of types
	*/
	function getTracks(options) {

		options = options || {};
		options.client_id = getClientId();

		var deferred = $q.defer();
		$http({
      method: 'GET',
      url: 'http://api.soundcloud.com/tracks.json',
      params: options
    })
    .success(function(data){
	  	deferred.resolve(data);
    })
    .error(function(reason){
    	$log.info("error!", reason);
    	deferred.reject(reason);
    });
		return deferred.promise;
	}


	/**
	 * Gets track for a given user
	 * @param  {[type]} options [description]
	 * @return {[type]}         [description]
	 */
	function getTracksByUser(options){
		options = options || {};
		options.client_id = getClientId();

		var user  = options.user;

 		// @TODO cleanup the options object


		var deferred = $q.defer();
		$http({
	    method: 'GET',
      url: 'http://api.soundcloud.com/users/'+ user +'/tracks.json',
      params: options
    }).success(function(data){
    	deferred.resolve(data);
    })
    .error(function(reason){
    	$log.info("error!", reason);
    	deferred.reject(reason);
    });
		return deferred.promise;
	}
}])

.factory('Utils',
function(){

	return {
		filterTags : filterTags
	}

	function filterTags(results){
		var cleanTags = [], temp;

		angular.forEach(results, function(item){

			if(item.tag_list != null){
					temp = item.tag_list.split(" ");
					angular.forEach(temp, function(tag){
						tag = tag.trim();
						if(tag.indexOf("soundcloud:") < 0 && tag != ""){
							cleanTags.push(tag.replace('"',''));
						}
					})
			}
		})
		cleanTags = _.uniq(cleanTags);
		return cleanTags;
	}

})

;
