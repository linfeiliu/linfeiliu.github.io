var capture
var prevCapture;
var prevFrame = [];
var counter = true;
var vscale = 20;
var threshold = 40;
var eps = 75;
var minPts = 10;
var point_data = [];
var target;
var v;

function setup() {
	createCanvas(windowWidth, windowHeight);
	pixelDensity(1);
	capture = createCapture(VIDEO);
	capture.size(width/vscale, height/vscale);
	capture.hide();
	v = new vehicle();
	target = createVector(0,0);
}


function draw() {
	background(000);
	vision();
}


function vision(){

	// a switch that populates an array with a length of 2
	counter = !counter;

	if (counter){
		prevFrame[0] = capture.get();
		if (frameCount > 2){
			prevFrame[1].loadPixels();
			prevCapture = prevFrame[1];
		}
	} else {
		prevFrame[1] = capture.get();
		if (frameCount > 2){
    	prevFrame[0].loadPixels();
			prevCapture = prevFrame[0];
		}
	}

	if(frameCount>2) {

    let counter = 0;

    // loop through pixel array
    for (let y = 0; y < capture.height; y++){
    	for (let x = 0; x < capture.width; x++){
				
				// index value for each pixel
				let i = (capture.width - (x + 1) + (y * capture.width)) * 4;
    		
				// red channel for current and previous frame
				let r1 = capture.pixels[i];
				let r2 = prevCapture.pixels[i];

				// difference between red channel value from previous to current frame
        let d = distSq(r1,r2);

				// if difference is greater than threshold
				if(d >= threshold * threshold) {

					let xp = x * vscale;
					let yp = y * vscale;

					//gray boxes for visual feedback
					fill(44,47,51);
					noStroke();
					rect(xp, yp, vscale, vscale);

					//array of points where motion occurs
					let foundPoint = {"x": xp, "y": yp};
					point_data.push(foundPoint);
        }
      }
    }
	}

	let dbscanner = jDBSCAN().eps(eps).minPts(minPts).distance('EUCLIDEAN').data(point_data);
	let point_assignment_result = dbscanner();
	let cluster_centers = dbscanner.getClusters();

	if (cluster_centers.length > 0) {

		let highscore = 0;

		for (let i = 0; i < cluster_centers.length; i++) {

			if (cluster_centers[i].dimension > highscore) {
				highscore = cluster_centers[i].dimension;
				target.set(cluster_centers[i].x, cluster_centers[i].y);
				stroke(0,215,253);
			} else {
				stroke(255);
			}
			noFill();
			strokeWeight(2);
			ellipse(cluster_centers[i].x, cluster_centers[i].y, cluster_centers[i].dimension);
		}
		
		v.seek(target);
	}
	
	v.update();
	v.show();
	point_data = [];
}


class vehicle {

	constructor(){
  	this.acceleration = createVector(0,0);
		this.velocity = createVector(0,0);
		this.position = createVector(width * 0.5, height * 0.5);
		this.maxspeed = 10;
		this.maxforce = 5;
    this.seeking = true;
	}

  seek(t){

    this.target = t;

    // A vector pointing from the position to the target
    this.desired = this.target.sub(this.position);

    this.d = this.desired.mag();

    // Slow down when close
    this.m = map(this.d, 0, 150, 0, this.maxspeed);

    this.desired.setMag(this.m);

    // Steering = Desired minus velocity
    this.steer = this.desired.sub(this.velocity);

    // Limit to maximum steering force
    this.steer.limit(this.maxforce);
    this.acceleration.add(this.steer);
  }

	update(){

    // Update velocity
    this.velocity.add(this.acceleration);

		// Limit speed
		this.velocity.limit(this.maxspeed);

    // Apply to Vehicle
		this.position.add(this.velocity);

    // Reset accelerationelertion to 0 each cycle
    this.acceleration.mult(0);
  }

  show(){
			noStroke();
			fill(227, 0, 34);
			ellipse(this.position.x, this.position.y, 20);
	}
}


function distSq(x1,x2) {
	d = (x2-x1)*(x2-x1);
  return d;
}



/* 
 Author: Corneliu S. (github.com/upphiminn)
 2013
 */
(function () {
	jDBSCAN = function () {
		//Local instance vars.
		var eps;
		var time_eps;
		var minPts;
		var data = [];
		var clusters = [];
		var status = [];
		var graph = [];
		var distance = euclidean_distance;
		var time_distance = timestamp_distance;

		//Utils
		function array_min(array, f) {
			var i = -1;
			var n = array.length;
			var a;
			var b;

			if (arguments.length === 1) {
				while (++i < n && !((a = array[i]) != null && a <= a))
					a = undefined;
				while (++i < n) if ((b = array[i]) != null && a > b)
					a = b;
			} else {
				while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a))
					a = undefined;
				while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b)
					a = b;
			}

			return a;
		}

		function array_max(array, f) {
			var i = -1;
			var n = array.length;
			var a;
			var b;

			if (arguments.length === 1) {
				while (++i < n && !((a = array[i]) != null && a <= a))
					a = undefined;
				while (++i < n) if ((b = array[i]) != null && b > a)
					a = b;
			} else {
				while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a))
					a = undefined;
				while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a)
					a = b;
			}

			return a;
		}

		//Distance Functions
		function timestamp_distance(point1, point2) {
			return Math.abs(point2.timestamp - point1.timestamp);
		}

		function euclidean_distance(point1, point2) {
			return Math.sqrt(Math.pow((point2.x - point1.x), 2) + Math.pow((point2.y - point1.y), 2));
		}

		function manhattan_distance(point1, point2) {
			return Math.abs(point2.x - point1.x) + Math.abs(point2.y - point1.y);
		}

		function haversine_distance(point1, point2) {
			// default 4 sig figs reflects typical 0.3% accuracy of spherical model
			if (typeof precision === 'undefined') {
				var precision = 4;
			}

			var R = 6371;
			var lat1 = point1.location.latitude * Math.PI / 180,
				lon1 = point1.location.longitude * Math.PI / 180;
			var lat2 = point2.location.latitude * Math.PI / 180,
				lon2 = point2.location.longitude * Math.PI / 180;

			var dLat = lat2 - lat1;
			var dLon = lon2 - lon1;

			var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
				Math.cos(lat1) * Math.cos(lat2) *
				Math.sin(dLon / 2) * Math.sin(dLon / 2);

			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
			var d = R * c;

			return d.toPrecision(precision);
		}

		//Core Algorithm Related
		function get_region_neighbours(point_idx) {
			var neighbours = [];
			var d = data[point_idx];

			for (var i = 0; i < data.length; i++) {
				if (point_idx === i) {
					continue;
				}
				if (time_eps &&  (time_distance(data[i], d) <= time_eps) && distance(data[i], d) <= eps) {
					neighbours.push(i);
				} else if (distance(data[i], d) <= eps) {
					neighbours.push(i);
				}
			}

			return neighbours;
		}

		function expand_cluster(point_idx, neighbours, cluster_idx) {
			clusters[cluster_idx - 1].push(point_idx); //add point to cluster
			status[point_idx] = cluster_idx;	//assign cluster id

			for (var i = 0; i < neighbours.length; i++) {
				var curr_point_idx = neighbours[i];
				if (status[curr_point_idx] === undefined) {
					status[curr_point_idx] = 0; //visited and marked as noise by default
					var curr_neighbours = get_region_neighbours(curr_point_idx);
					var curr_num_neighbours = curr_neighbours.length;
					if (curr_num_neighbours >= minPts) {
						expand_cluster(curr_point_idx, curr_neighbours, cluster_idx);
					}
				}

				if (status[curr_point_idx] < 1) { // not assigned to a cluster but visited (= 0)
					status[curr_point_idx] = cluster_idx;
					clusters[cluster_idx - 1].push(curr_point_idx);
				}
			}
		}

		var dbscan = function () {
			status = [];
			clusters = [];

			for (var i = 0; i < data.length; i++) {
				if (status[i] === undefined) {
					status[i] = 0; //visited and marked as noise by default
					var neighbours = get_region_neighbours(i);
					var num_neighbours = neighbours.length;
					if (num_neighbours < minPts) {
						status[i] = 0; //noise
					} else {
						clusters.push([]); //empty new cluster
						var cluster_idx = clusters.length;
						expand_cluster(i, neighbours, cluster_idx);
					}
				}
			}

			return status;
		};

		//Resulting Clusters Center Points
		dbscan.getClusters = function () {
			var num_clusters = clusters.length;
			var clusters_centers = [];

			for (var i = 0; i < num_clusters; i++) {
				if (distance === euclidean_distance || distance === manhattan_distance) {
					clusters_centers[i] = {x: 0, y: 0};

					for (var j = 0; j < clusters[i].length; j++) {
						clusters_centers[i].x += data[clusters[i][j]].x;
						clusters_centers[i].y += data[clusters[i][j]].y;
					}

					clusters_centers[i].x /= clusters[i].length;
					clusters_centers[i].y /= clusters[i].length;
					clusters_centers[i].dimension = clusters[i].length;
					clusters_centers[i].parts = clusters[i];
				}

				if (distance === haversine_distance) {
					clusters_centers[i] = {location: {latitude: 0, longitude: 0, accuracy: 0}};

					for (var j = 0; j < clusters[i].length; j++) {
						clusters_centers[i].location.latitude += data[clusters[i][j]].location.latitude;
						clusters_centers[i].location.longitude += data[clusters[i][j]].location.longitude;
						clusters_centers[i].location.accuracy += data[clusters[i][j]].location.accuracy;
					}

					clusters_centers[i].dimension = clusters[i].length;
					clusters_centers[i].parts = clusters[i];
					clusters_centers[i].location.latitude /= clusters[i].length;
					clusters_centers[i].location.longitude /= clusters[i].length;
					clusters_centers[i].location.accuracy /= clusters[i].length;
				}

				if (time_eps) {
					clusters_centers[i].duration = {};
					clusters_centers[i].duration.start = array_min(clusters[i], function (d) {
						return data[d].timestamp;
					});
					clusters_centers[i].duration.end = array_max(clusters[i], function (d) {
						return data[d].timestamp;
					});
					clusters_centers[i].duration.span = clusters_centers[i].duration.end - clusters_centers[i].duration.start;
				}
			}

			return clusters_centers;
		};

		//Getters and setters
		dbscan.data = function (d) {
			if (arguments.length === 0) {
				return data;
			}
			if (Array.isArray(d)) {
				data = d;
			}

			return dbscan;
		};

		dbscan.eps = function (e) {
			if (arguments.length === 0) {
				return eps;
			}
			if (typeof e === "number") {
				eps = e;
			}

			return dbscan;
		};

		dbscan.timeEps = function (e) {
			if (arguments.length === 0) {
				return time_eps;
			}
			if (typeof e === "number") {
				time_eps = e;
			}

			return dbscan;
		};

		dbscan.minPts = function (p) {
			if (arguments.length === 0) {
				return minPts;
			}
			if (typeof p === "number") {
				minPts = p;
			}

			return dbscan;
		};

		dbscan.distance = function (fct) {
			if (arguments.length === 1) {
				if (typeof fct === 'string') {
					switch (fct) {
						case 'HAVERSINE':
							distance = haversine_distance;
							break;
						case 'EUCLIDEAN':
							distance = euclidean_distance;
							break;
						case 'MANHATTAN':
							distance = manhattan_distance;
							break;
						default:
							distance = euclidean_distance;
					}
				} else if (typeof fct === 'function') {
					distance = fct;
				}
			}

			return dbscan;
		};

		dbscan.timeDistance = function (fct) {
			if (arguments.length === 1) {
				time_distance = fct;
			}

			return dbscan;
		};

		return dbscan;
	}
})();