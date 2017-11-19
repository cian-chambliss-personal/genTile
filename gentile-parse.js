const pipeChar = "|".charCodeAt(0);
const dashChar = "-".charCodeAt(0);
const asteriskChar = "*".charCodeAt(0);
const plusChar = "+".charCodeAt(0);
const slashChar = "/".charCodeAt(0);
const backSlashChar = "\\".charCodeAt(0);
const quoteChar = '"'.charCodeAt(0);
const equalChar = "=".charCodeAt(0);
const colonChar = ':'.charCodeAt(0);

//---------------- The map class
class Map {
    constructor() {
        this.tiles = [];
        this.legend = {};
        this.height = [];
        this.islands = [];
        this.objects = [];
        this.features = [];
        this.softCells = {}; // scalar hash
        this.edges = {}; // lrtb index
    }
    cellSlopeGet(row, col, drow, dcol) {
        return this.softCells[(row + drow) + "x" + (col + dcol)] || 0;
    }
    getTileBounds(id) {
        var mapPtr = this;
        const adjustPoint = function (edges, point, upper) {
            var edge = edges[point[0] + "x" + point[1]];
            if (edge) {
                if (edge.indexOf("r") >= 0) {
                    if (edge.indexOf("b") >= 0) {
                        if (upper) {
                            return [point[0] - mapPtr.cellSlopeGet(point[0], point[1], 0, -1) + 1, point[1] - mapPtr.cellSlopeGet(point[0], point[1], -1, 0) + 1];
                        }
                        return [point[0] + 1, point[1] + 1];
                    }
                    if (upper) {
                        if (edge.indexOf("t") >= 0) {
                            return [point[0] + mapPtr.cellSlopeGet(point[0], point[1], 0, 1), point[1] - mapPtr.cellSlopeGet(point[0], point[1], 0, -1) + 1]
                        }
                        return [point[0], point[1] - mapPtr.cellSlopeGet(point[0], point[1], 0, -1) + 1];
                    }
                    return [point[0], point[1] + 1];
                }
                if (edge.indexOf("b") >= 0) {
                    if (upper) {
                        if (edge.indexOf("l") >= 0) {
                            return [point[0] - mapPtr.cellSlopeGet(point[0], point[1], -1, 0) + 1, point[1] + mapPtr.cellSlopeGet(point[0], point[1], 0, 1)];
                        }
                        return [point[0] - mapPtr.cellSlopeGet(point[0], point[1], -1, 0) + 1, point[1]];
                    }
                    return [point[0] + 1, point[1]];
                }
                if (upper) {
                    if (edge.indexOf("t") >= 0) {
                        if (edge.indexOf("l") >= 0) {
                            return [point[0] + mapPtr.cellSlopeGet(point[0], point[1], 1, 0), point[1] + mapPtr.cellSlopeGet(point[0], point[1], 0, 1)];
                        }
                        return [point[0] + mapPtr.cellSlopeGet(point[0], point[1], 1, 0), point[1]];
                    }
                    if (edge.indexOf("l") >= 0) {
                        return [point[0], point[1] + mapPtr.cellSlopeGet(point[0], point[1], 0, 1)];
                    }
                }
            }
            return point;
        };
        var row, col, i;
        var points = {}, neighbors;
        var lower = [];
        var upper = [];
        var npoint = 0, point;
        for (row = 0; row < this.rows; ++row) {
            for (col = 0; col < this.cols; ++col) {
                if (this.tiles[row][col] === id) {
                    neighbors = 0;
                    if (col > 0 && this.tiles[row][col - 1] === id)
                        ++neighbors;
                    if ((col + 1) < this.cols && this.tiles[row][col + 1] === id)
                        ++neighbors;
                    if (row > 0 && this.tiles[row - 1][col] === id)
                        ++neighbors;
                    if ((row + 1) < this.rows && this.tiles[row + 1][col] === id)
                        ++neighbors;
                    if (neighbors < 4) {
                        if (!point) {
                            point = [row, col];
                            lower.push(adjustPoint(this.edges, point));
                            upper.push(adjustPoint(this.edges, point, true));
                        } else {
                            points[row + "x" + col] = true;
                            npoint++;
                        }
                    }
                }
            }
        }
        while (npoint > 0) {
            if (points[(point[0] - 1) + "x" + point[1]]) {
                points[(point[0] - 1) + "x" + point[1]] = false;
                point = [(point[0] - 1), point[1]];
            } else if (points[point[0] + "x" + (point[1] + 1)]) {
                points[point[0] + "x" + (point[1] + 1)] = false;
                point = [point[0], point[1] + 1];
            } else if (points[(point[0] + 1) + "x" + point[1]]) {
                points[(point[0] + 1) + "x" + point[1]] = false;
                point = [(point[0] + 1), point[1]];
            } else if (points[point[0] + "x" + (point[1] - 1)]) {
                points[point[0] + "x" + (point[1] - 1)] = false;
                point = [point[0], point[1] - 1];
            } else if (points[(point[0] + 1) + "x" + (point[1] + 1)]) {
                points[(point[0] + 1) + "x" + (point[1] + 1)] = false;
                point = [point[0] + 1, point[1] + 1];
            } else if (points[(point[0] + 1) + "x" + (point[1] - 1)]) {
                points[(point[0] + 1) + "x" + (point[1] - 1)] = false;
                point = [point[0] + 1, point[1] - 1];
            } else if (points[(point[0] - 1) + "x" + (point[1] - 1)]) {
                points[(point[0] - 1) + "x" + (point[1] - 1)] = false;
                point = [point[0] - 1, point[1] - 1];
            } else {
                break;
            }
            lower.push(adjustPoint(this.edges, point));
            upper.push(adjustPoint(this.edges, point, true));
            --npoint;
        }
        return { lower: lower, upper: upper };
    }
};

class GT_NameGenerator {
    constructor() {
        this.namesUsed = {};
        this.baseName = {};
    }
    AddName(name) {
        name = name.trim().toLowerCase();
        this.namesUsed[name] = true;
    }
    GetName(type) {
        var prefix, index;
        type = type.trim() + "_";
        prefix = type.toLowerCase();
        index = this.baseName[prefix];
        if (!index) {
            index = 1;
        }
        while (this.namesUsed[prefix + index])
            ++index;
        this.baseName[prefix] = index;
        type = type + index;
        this.AddName(type);
        return type;
    }
};

class GenTileDef {
    constructor() {
        this.expanseTypes = {};
        this.featureTypes = {};
        this.map = {};
    }
    getExpanseIslands(map) {
        // Get the 'bounds' of expanse islands
        var islands = [], i, mi;
        if (map.expanseType) {
            islands.push({ expanseType: map.expanseType, edge: { lower: [[0, 0], [0, map.cols], [map.rows, map.cols], [map.rows, 0]] } });
        }
        for (i = 0; i < map.islands.length; ++i) {
            mi = map.islands[i];
            islands.push({ expanseType: mi.expanseType, edge: map.getTileBounds(mi.tileId) });
        }
        return islands;
    }
    getSegmentsFromPath(feature, dx, dy) {
        var segments = [], points = [], i, j, x, y, ch, pt;
        var path = feature.path;
        var widths = [], width = 1 , widthChanged = false;
        for (i = 0; i < path.length; ++i) {
            pt = path[i];
            y = pt[0] * dy;
            x = pt[1] * dx;
            ch = pt[2];
            if (ch === pipeChar || ch === quoteChar) {
                if (ch === quoteChar)
                    width = 2;
                else
                    width = 1;
                x += 0.5 * dx;
            } else if (ch === dashChar || ch === equalChar) {
                if (ch === equalChar)
                    width = 2;
                else
                    width = 1;
                y += 0.5 * dy;
            } else if (ch === asteriskChar || ch === plusChar || ch === slashChar || ch === backSlashChar) {
                x += 0.5 * dx;
                y += 0.5 * dy;
            }
            points.push(x);
            points.push(y);
            if( !widthChanged && widths.length ) {
                if( widths[widths.length-1] !== width ) {
                    widthChanged = true;
                }
            }
            widths.push(width);
        }
        if( !widthChanged ) {
            widths = width;
        }
        segments.push({ featureType: feature.featureType, path: points, width: widths });
        return segments;
    }
    generateExPathIntermediate(path, z) {
        var po = { channels: { x: [], y: [], z: 0 } }, i;
        for (i = 0; i < path.length; ++i) {
            po.channels.y.push(path[i][0]);
            po.channels.x.push(path[i][1]);
        }
        po.channels.z = z;
        return po;
    }
    generateMapIntermediate(map) {
        var islands = this.getExpanseIslands(map), island, i, j;
        var enames = new GT_NameGenerator();
        var fnames = new GT_NameGenerator();
        var onames = new GT_NameGenerator();
        var mapDef = { expanse: {}, feature: {}, object: {} }, expanse, feature, path, objInst;
        for (i = 0; i < islands.length; ++i) {
            island = islands[i];
            if (island.name) {
                enames.AddName(island.name)
            } else {
                island.name = enames.GetName(island.expanseType || "expanse");
            }
            expanse = { levels: {} };
            if (island.edge.lower) {
                expanse.levels.lower = this.generateExPathIntermediate(island.edge.lower, 0);
            }
            if (island.edge.upper) {
                expanse.levels.upper = this.generateExPathIntermediate(island.edge.upper, 1);
            }
            mapDef.expanse[island.name] = expanse;
        }
        for (i = 0; i < map.features.length; ++i) {
            islands = this.getSegmentsFromPath(map.features[i], 1, 1);
            for (j = 0; j < islands.length; ++j) {
                island = islands[j];
                if (island.name) {
                    fnames.AddName(island.name)
                } else {
                    island.name = fnames.GetName(island.featureType || "feature");
                }
                feature = { channels: { x: [], y: [], z: 0, width: island.width , type: island.featureType || "feature" } };
                path = island.path;
                for (j = 0; j < path.length; j += 2) {
                    feature.channels.x.push(path[j]);
                    feature.channels.y.push(path[j + 1]);
                }
                feature.channels.z = 0;
                mapDef.feature[island.name] = feature;
            }
        }
        for (i = 0; i < map.objects.length; ++i) {
            island = map.objects[i];
            if (island.type) {
                if (island.name) {
                    onames.AddName(island.name)
                } else {
                    island.name = onames.GetName(island.type);
                }
                objInst = { type: island.type, x: (island.col), row: (island.row) };
                mapDef.object[island.name] = objInst;
            }
        }
        return mapDef;
    }
    generateIntermediate() {
        var obj = { defs: { expanse: this.expanseTypes, feature: this.featureTypes }, maps: {} }, mapName, map;
        for (mapName in this.map) {
            obj.maps[mapName] = this.generateMapIntermediate(this.map[mapName]);
        }
        return obj;
    }
};

/*
 * Parse a single character cell (includes the legend lookup for type)
 */
const getCell = function (map, row, col) {
    var raw = map.tiles[row].substr(col, 1);
    var legend = null;
    if (map.legend[raw]) {
        legend = map.legend[raw];
    }
    return { raw: raw, legend: legend };
};

/*
 * Fill expanse at location with an index, scan across, recurse up and down... 
 */
const fillExpanse = function (tilemap, row, col, index) {
    var i;
    const rows = tilemap.length;
    const cols = tilemap[row].length;
    var start = col, end = col;
    tilemap[row][col] = index;
    i = col - 1;
    // Scan back
    while (i > 0 && tilemap[row][i] === 0) {
        tilemap[row][i] = index;
        start = i;
        --i;
    }
    // Scan forward
    i = col + 1;
    while (i < cols && tilemap[row][i] === 0) {
        tilemap[row][i] = index;
        end = i;
        ++i;
    }
    // Scan up...
    if (row > 0) {
        for (i = start; i <= end; ++i) {
            if (tilemap[row - 1][i] === 0) {
                fillExpanse(tilemap, row - 1, i, index);
            }
        }
    }
    // Scan down...
    if ((row + 1) < rows) {
        for (i = start; i <= end; ++i) {
            if (tilemap[row + 1][i] === 0) {
                fillExpanse(tilemap, row + 1, i, index);
            }
        }
    }
};


/*
 *  Inline replace feature characters and extract the paths
 */
const followFeatures = function (tiles, row, col) {
    var features = [];
    var feature = [];
    var notTaken = {};
    const isVert = function (row, col) {
        var ch = tiles[row];
        if (ch) {
            ch = ch[col];
        }
        if (ch === pipeChar
            || ch === plusChar
            || ch === asteriskChar
            || ch === quoteChar
        ) {
            return true;
        }
        return false;
    };
    const isHoriz = function (row, col) {
        var ch = tiles[row];
        if (ch) {
            ch = ch[col];
        }
        if (ch === dashChar
            || ch === plusChar
            || ch === asteriskChar
            || ch === equalChar
        ) {
            return true;
        }
        return false;
    };
    const isDiag = function (row, col, lastCh) {
        var ch = tiles[row];
        if (ch) {
            ch = ch[col];
        }
        if (ch === slashChar || ch === backSlashChar) {
            return true;
        }
        if (ch == asteriskChar) {
            if (lastCh === slashChar || lastCh === backSlashChar) {
                return true;
            }
        }
        return false;
    };


    const recursePath = function (row, col, lastChar) {
        var ch = tiles[row][col];
        feature.push([row, col, ch]);
        tiles[row][col] = 0;
        if (ch === pipeChar || ch === quoteChar) {
            if (isVert(row - 1, col)) {
                recursePath(row - 1, col, pipeChar);
            }
            if (isVert(row + 1, col)) {
                recursePath(row + 1, col, pipeChar);
            }
        } else if (ch === dashChar || ch === equalChar) {
            if (isHoriz(row, col - 1)) {
                recursePath(row, col - 1, dashChar);
            }
            if (isHoriz(row, col + 1)) {
                recursePath(row, col + 1, dashChar);
            }
        } else if (ch === plusChar || ch === asteriskChar || ch === slashChar || ch === backSlashChar) {
            if (lastChar === dashChar || lastChar === equalChar) {
                if (isHoriz(row, col - 1)) {
                    recursePath(row, col - 1, dashChar);
                } else if (isHoriz(row, col + 1)) {
                    recursePath(row, col + 1, dashChar);
                } else if (isDiag(row - 1, col - 1, ch)) {
                    recursePath(row - 1, col - 1, dashChar);
                } else if (isDiag(row - 1, col + 1, ch)) {
                    recursePath(row - 1, col + 1, dashChar);
                } else if (isDiag(row + 1, col - 1, ch)) {
                    recursePath(row + 1, col - 1, dashChar);
                } else if (isDiag(row + 1, col + 1, ch)) {
                    recursePath(row + 1, col + 1, dashChar);
                } else if (isVert(row - 1, col)) {
                    recursePath(row - 1, col, pipeChar);
                } else if (isVert(row + 1, col)) {
                    recursePath(row + 1, col, pipeChar);
                }
            } else if (lastChar === pipeChar || lastChar === quoteChar) {
                if (isVert(row - 1, col)) {
                    recursePath(row - 1, col, pipeChar);
                } else if (isVert(row + 1, col)) {
                    recursePath(row + 1, col, pipeChar);
                } else if (isDiag(row - 1, col - 1, ch)) {
                    recursePath(row - 1, col - 1, pipeChar);
                } else if (isDiag(row - 1, col + 1, ch)) {
                    recursePath(row - 1, col + 1, pipeChar);
                } else if (isDiag(row + 1, col - 1, ch)) {
                    recursePath(row + 1, col - 1, pipeChar);
                } else if (isDiag(row + 1, col + 1, ch)) {
                    recursePath(row + 1, col + 1, pipeChar);
                } else if (isHoriz(row, col - 1)) {
                    recursePath(row, col - 1, dashChar);
                } else if (isHoriz(row, col + 1)) {
                    recursePath(row, col + 1, dashChar);
                }
            }
            if (ch === plusChar) {
                tiles[row][col] = plusChar;
            }
        }
    };
    recursePath(row, col);
    features.push({ path: feature });
    return features;
};

/*
 *  Convert Ascii maps into height/ texture and object data
 */
const postProcessMap = function (def, map) {
    var rows = map.tiles.length, line;
    var cols = map.tiles[0].length, i, j, k, z;
    var tilemap = [];
    var row, col, cell, codes, code;
    var heights = [], height;
    var expanseTypes = [], featureTypes = [], expanseType;
    for (row = 0; row < rows; ++row) {
        codes = [];
        for (col = 0; col < cols; ++col) {
            code = 0;
            cell = getCell(map, row, col);
            if (cell.legend) {
                if (cell.legend.objType) {
                    map.objects.push({ type: cell.legend.objType, row: row, col: col });
                }
                if (cell.legend.expanseType
                    || cell.legend.height || cell.legend.scalar
                ) {
                    expanseTypes.push({ legend: cell.legend, row: row, col: col });
                }
                if (cell.legend.featureType) {
                    featureTypes.push({ legend: cell.legend, row: row, col: col });
                }
                code = cell.legend.replaces.charCodeAt(0);
            } else {
                code = cell.raw.charCodeAt(0);
            }
            if (code === 32) {
                code = 0;
            }
            codes.push(code);
        }
        tilemap.push(codes);
    }
    // Collect feature 'overlays'
    var features = [], feature;
    for (row = 0; row < rows; ++row) {
        for (col = 0; col < cols; ++col) {
            if (tilemap[row][col] === pipeChar
                || tilemap[row][col] === quoteChar
                || tilemap[row][col] === dashChar
                || tilemap[row][col] === equalChar
            ) {
                features = features.concat(followFeatures(tilemap, row, col));
            }
        }
    }
    for (i = 0; i < features.length; ++i) {
        feature = features[i];
        for (j = 0; j < feature.path.length; ++j) {
            row = feature.path[j][0];
            col = feature.path[j][1];
            for (k = 0; k < featureTypes.length; ++k) {
                if (featureTypes[k].row === row) {
                    if (featureTypes[k].col == col) {
                        feature.featureType = featureTypes[k].legend.featureType;
                        break;
                    }
                }
            }
        }
    }
    // Collect 'slope' adjustment characters - replace with 0
    var softCells = {};
    const softChar = ".".charCodeAt(0);
    for (row = 0; row < rows; ++row) {
        for (col = 0; col < cols; ++col) {
            if (tilemap[row][col] === softChar) {
                softCells["" + row + "x" + col] = 1;
                tilemap[row][col] = 0;
            }
        }
    }
    // Left/Right/Up/Down edge of elevation change used to mark islands
    const leftSide = "<".charCodeAt(0);
    const rightSide = ">".charCodeAt(0);
    const topSide = "^".charCodeAt(0);
    const bottomSide = "v".charCodeAt(0);
    var islandId = 0;
    var islands = {};
    var edges = {};
    // Look for 'expanse' islands
    for (row = 0; row < rows; ++row) {
        for (col = 0; col < cols; ++col) {
            if (tilemap[row][col] > 0) {
                if (tilemap[row][col] === leftSide) {
                    if ((col + 1) < cols) {
                        if (tilemap[row][col + 1] === 0) {
                            islandId -= 1;
                            fillExpanse(tilemap, row, col + 1, islandId);
                            tilemap[row][col] = islandId;
                        } else if (tilemap[row][col + 1] < 0) {
                            tilemap[row][col] = tilemap[row][col + 1];
                        }
                        edges["" + row + "x" + col] = "l";
                    }
                } else if (tilemap[row][col] === topSide) {
                    if ((row + 1) < rows) {
                        if (tilemap[row + 1][col] === 0) {
                            islandId -= 1;
                            fillExpanse(tilemap, row + 1, col, islandId);
                            tilemap[row][col] = islandId;
                        } else if (tilemap[row + 1][col] < 0) {
                            tilemap[row][col] = tilemap[row + 1][col];
                        }
                        edges["" + row + "x" + col] = "t";
                    }
                } else if (tilemap[row][col] === rightSide) {
                    if (col > 0) {
                        if (tilemap[row][col - 1] === 0) {
                            islandId -= 1;
                            fillExpanse(tilemap, row, col - 1, islandId);
                            tilemap[row][col] = islandId;
                        } else if (tilemap[row][col - 1] < 0) {
                            tilemap[row][col] = tilemap[row][col - 1];
                        }
                        edges["" + row + "x" + col] = "r";
                    }
                } else if (tilemap[row][col] === bottomSide) {
                    if (row > 0) {
                        if (tilemap[row - 1][col] === 0) {
                            islandId -= 1;
                            fillExpanse(tilemap, row - 1, col, islandId);
                            tilemap[row][col] = islandId;
                        } else if (tilemap[row - 1][col] < 0) {
                            tilemap[row][col] = tilemap[row - 1][col];
                        }
                    }
                    edges["" + row + "x" + col] = "b";
                }
            }
        }
    }
    // Build 'expanse' island info
    for (i = 0; i < expanseTypes.length; ++i) {
        expanseType = expanseTypes[i];
        cell = tilemap[expanseType.row][expanseType.col];
        if (cell < 0) {
            if (!islands["" + cell]) {
                islands["" + cell] = { tileId: cell };
                map.islands.push(islands["" + cell]);
            }
            cell = islands["" + cell];
            if (expanseType.legend.expanseType) {
                cell.expanseType = expanseType.legend.expanseType;
            }
            if (expanseType.legend.height) {
                cell.height = expanseType.legend.height;
            }
        }
    }
    // Now that we have islands of expanse, lets index heights & types
    for (row = 0; row < rows; ++row) {
        height = [];
        for (col = 0; col < cols; ++col) {
            cell = tilemap[row][col];
            z = 0;
            if (cell < 0) {
                cell = islands["" + cell];
                z = 1;
                if (cell) {
                    if (cell.height) {
                        z = cell.height;
                    }
                }
            }
            height.push(z);
        }
        heights.push(height);
    }
    map.rows = rows;
    map.cols = cols;
    map.tiles = tilemap;
    map.heights = heights;
    map.softCells = softCells;
    map.edges = edges;
    map.features = features;
};

/*
 * Top level parser for gentile files
 * finds maps / legends / definitions and generates height/texture maps and paths 
 */
const parseGentile = function (source) {
    var obj = new GenTileDef(), map = null;
    var lines = source.split("\n"), line, pendingMap = null, pendLine = null, replaces;
    var i, name, parts, part, legend, f;
    var pendingDef = null;

    for (i = 0; i < lines.length; ++i) {
        line = lines[i].trim();
        if (pendingDef) {
            pendingDef += line;
            if (pendingDef.split("{").length === pendingDef.split("}").length) {
                // Process a definition
                name = pendingDef.substr(0, pendingDef.indexOf("=")).trim();
                pendingDef = pendingDef.substr(pendingDef.indexOf("=") + 1);
                try {
                    pendingDef = JSON.parse(pendingDef);
                    if (name.charAt(0) === '#') {
                        name = name.substr(1).trim();
                        obj.expanseTypes[name] = pendingDef;
                    } else if (name.charAt(0) === '!') {
                        name = name.substr(1).trim();
                        obj.featureTypes[name] = pendingDef;
                    }
                } catch (err) {
                    console.log(err);
                }
                pendingDef = null;
            }
        } else if (line.indexOf('=') > 0
            && line.substr(line.indexOf('=') + 1).trim() == '{') {
            pendingDef = line;
        } else if (line.substr(0, 1) === '@') {
            pendingMap = line.substr(1);
            map = null;
            mapLines = -1;
            pendLine = null;
        } else if (line.substr(0, 1) === '#' || (map && line.substr(0, 1) === '.')) {
            if (line.length > 1 && (line.substr(line.length - 1) === "#" || line.substr(line.length - 1) === ".")) {
                // Add lines
                if (pendingMap) {
                    if (map) {
                        if (pendLine)
                            map.tiles.push(pendLine);
                        pendLine = line.substr(1, line.length - 2);
                    } else {
                        obj.map[pendingMap] = new Map();
                        map = obj.map[pendingMap];
                    }
                }
            } else if (map) {
                // Get the key
                line = line.substr(1).trim();
                line = line.split("=");
                if (line.length > 1) {
                    replaces = " ";
                    name = line[0].trim();
                    parts = name.split("(")
                    if (parts.length > 1) {
                        name = parts[0].trim()
                        replaces = parts[1].charAt(0);
                    }
                    parts = line[1].split(";");
                    legend = { replaces: replaces };
                    for (f = 0; f < parts.length; ++f) {
                        part = parts[f].trim().charAt(0);
                        if (part === '#') {
                            legend.expanseType = parts[f].trim().substr(1);
                        } else if (part === '!') {
                            legend.featureType = parts[f].trim().substr(1);
                        } else if (part === '+' || part === '-') {
                            legend.height = parseFloat(parts[f].trim());
                        } else if (part === '*') {
                            legend.scalar = parseFloat(parts[f].trim().substr(1));
                        } else {
                            legend.objType = parts[f].trim();
                        }
                    }
                    map.legend[name] = legend;
                } else {
                    parts = line[0].split(";");
                    for (f = 0; f < parts.length; ++f) {
                        part = parts[f].trim().charAt(0);
                        if (part === "#") {
                            map.expanseType = parts[f].trim().substr(1);
                        } else if (part === "!") {
                            map.featureType = parts[f].trim().substr(1);
                        }
                    }
                }
                pendingMap = null;
            }
        } else {
            pendingMap = null;
        }
    }
    // Postprocess the tiles...
    for (i in obj.map) {
        postProcessMap(obj, obj.map[i]);
    }
    return obj;
};

exports.parseGentile = function (def) {
    var gt = parseGentile(def);
    return gt.generateIntermediate();
}
