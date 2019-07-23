(function () {
    angular
        .module('flapperNews.controllers.nav', [])
        .controller('NavController', ['$scope', 'authService', function($scope, authService) {
            // $scope.isLoggedIn = authService.isLoggedIn;
            // $scope.currentUser = authService.currentUser;
            // $scope.logOut = authService.logOut;
            function onInit() {
                console.log('nav controller loaded');
            }

            onInit();

        }]);

})();
