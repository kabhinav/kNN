/*
 * k Nearest Neighbour algorithm implementation.
 */

var Node = function (obj) {
    for (var feature in obj) {
        this[feature] = obj[feature];
    }
};


Node.prototype.computeDistances = function (features) {
    for (var i in this.neighbours) {
	var neighbour = this.neighbours[i];
	var total_distance = 0
	for (var j in features){
	    var feature = features[j];
	    var distance = neighbour[j] - this[j];
            distance = distance / (feature.max - feature.min);
	    total_distance += (distance * distance);
	}

	neighbour.distance = Math.sqrt(total_distance);
    }
};


Node.prototype.orderByDistance = function () {
    this.neighbours.sort(function (node1, node2) {
        return (node1.distance - node2.distance);
    });
};


Node.prototype.classify = function (kNN) {
    var categories = {};

    for (var i in this.neighbours.slice(0, kNN)) {
	var neighbour = this.neighbours[i];

        if (!categories[neighbour.category]) {
            categories[neighbour.category] = 0;
        }
        categories[neighbour.category] += 1;
    }

    var cls = {
        category: false,
        count: 0
    };
    for (var category in categories) {
        if (categories[category] > cls.count) {
            cls.category = category;
            cls.count = categories[category];
        }
    }

    this.classification = cls;

    return categories;
};


// Collection of all instances: training as well as unkown
var Nodes = function (kNN) {
    this.nodes = [];
    this.kNN = kNN;
};


Nodes.prototype.add = function (node) {
    this.nodes.push(node);
};


/* Compute the attributes value ranges.
 * The ranges will be used to  normalize the values.
 */
Nodes.prototype.computeRanges = function (features) {

    for (var feature in features){
	this[feature] = features[feature];
    }

    for (var n in this.nodes) {
	for (var feature in features){
	    if(this.nodes[n][feature] < this[feature].min){
		this[feature].min = this.nodes[n][feature];
	    }

	    if(this.nodes[n][feature] > this[feature].max){
		this[feature].max = this.nodes[n][feature];
	    }
	}
    }
};


//Classify an unknown object and assign a class to it.
Nodes.prototype.classifyUnknown = function (features) {
    // compute a feature's min, max range
    this.computeRanges(features);

    /*
     * Loop through the nodes for an unknown node category.
     */
    for (var node in this.nodes) {
        if (!this.nodes[node].category) {
            /* Copy the nodes for computing local distances
             * from this unknown node.
             */
            this.nodes[node].neighbours = [];
            for (var n in this.nodes) {
                if (!this.nodes[n].category) {
                    // another unclassified node
                    continue;
                }
                this.nodes[node].neighbours.push(new Node(this.nodes[n]));
            }

            /* Compute distances */
            this.nodes[node].computeDistances(features);

            /* Order by distances */
            this.nodes[node].orderByDistance();

            /* Classify the unknown */
            console.log(this.nodes[node].classify(this.kNN));
        }
    }
};

/////////////////////////////////////////////////////////////
/*
 * Test harness: Classifying an unknown new car into an
 * into categories Sport, Sedan, Coupe or SUV.
 */
Nodes.prototype.draw = function (canvas_id) {
    var seats_range = this.seats.max - this.seats.min;
    var cost_range = this.cost.max - this.cost.min;

    var canvas = document.getElementById(canvas_id);
    var ctx = canvas.getContext("2d");
    var width = 640;
    var height = 480;
    ctx.clearRect(0, 0, width, height);

    for (var i in this.nodes) {
        ctx.save();

        switch (this.nodes[i].category) {
            case 'sports':
                ctx.fillStyle = 'red';
                break;
            case 'sedan':
                ctx.fillStyle = 'green';
                break;
            case 'van':
                ctx.fillStyle = 'blue';
                break;
            case 'suv':
                ctx.fillStyle = 'yellow';
                break;
            default:
                ctx.fillStyle = 'black';
        }

        var padding = 40;
        var x_shift_pct = (width - padding) / width;
        var y_shift_pct = (height - padding) / height;

        var x = (this.nodes[i].seats - this.seats.min) * (width / seats_range) * x_shift_pct + (padding / 2);
        var y = (this.nodes[i].cost - this.cost.min) * (height / cost_range) * y_shift_pct + (padding / 2);
        y = Math.abs(y - height);

        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.closePath();

        // Unclassified Node
        if (!this.nodes[i].category) {
            switch (this.nodes[i].classification.category) {
                case 'sports':
                    ctx.fillStyle = 'red';
                    break;
                case 'sedan':
                    ctx.fillStyle = 'green';
                    break;
                case 'van':
                    ctx.fillStyle = 'blue';
                    break;
                case 'suv':
                    ctx.fillStyle = 'yellow';
                    break;
                default:
                    ctx.fillStyle = 'black';
            }

            var radius = this.nodes[i].neighbours[this.kNN - 1].distance * width;
            radius *= x_shift_pct;
            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2, true);
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
    }
};


function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};


var nodes;


var data = [{
    seats: 2,
    cost: 40000,
    category: 'sports'
}, {
    seats: 3,
    cost: 39000,
    category: 'sports'
}, {
    seats: 4,
    cost: 35000,
    category: 'sports'
}, {
    seats: 3,
    cost: 36000,
    category: 'sports'
}, {
    seats: 2,
    cost: 38000,
    category: 'sports'
}, {
    seats: 5,
    cost: 31000,
    category: 'sports'
}, {
    seats: 4,
    cost: 25000,
    category: 'sedan'
}, {
    seats: 5,
    cost: 20000,
    category: 'sedan'
}, {
    seats: 3,
    cost: 30000,
    category: 'sedan'
}, {
    seats: 4,
    cost: 26000,
    category: 'sedan'
}, {
    seats: 2,
    cost: 30000,
    category: 'sedan'
}, {
    seats: 4,
    cost: 32000,
    category: 'sedan'
}, {
    seats: 7,
    cost: 27000,
    category: 'van'
}, {
    seats: 9,
    cost: 29000,
    category: 'van'
}, {
    seats: 5,
    cost: 34000,
    category: 'van'
},  {
    seats: 6,
    cost: 36000,
    category: 'van'
}, {
    seats: 5,
    cost: 30000,
    category: 'van'
}, {
    seats: 4,
    cost: 33000,
    category: 'van'
}, {
    seats: 6,
    cost: 38000,
    category: 'suv'
}, {
    seats: 4,
    cost: 32000,
    category: 'suv'
}, {
    seats: 8,
    cost: 37000,
    category: 'suv'
},{
    seats: 5,
    cost: 33000,
    category: 'suv'
},{
    seats: 7,
    cost: 35000,
    category: 'suv'
},{
    seats: 5,
    cost: 31000,
    category: 'suv'
} ];


var do_classification = function () {

    nodes = new Nodes(2);
    for (var i in data) {
        nodes.add(new Node(data[i]));
    }
    var random_seats = getRandomInt(2, 9);
    console.log("Seats: " + random_seats);
    var random_cost = getRandomInt(20000, 40000);
    console.log("Cost: " + random_cost);
    nodes.add(new Node({
        seats: random_seats,
        cost: random_cost,
        category: false
    }));

    nodes.classifyUnknown({
	seats: {min: 100, max: 0},
	cost: {min: 100000, max: 0}
    });

    nodes.draw("canvas");
};


setInterval(do_classification, 3000);
do_classification();