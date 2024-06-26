/* eslint-disable */
// based on d3noob's code at https://bl.ocks.org/d3noob/43a860bc0024792f8803bba8ca0d5ecd

import * as d3 from 'd3';

export function makeListContext(items, color, margins, fontSize) {
    let tree = makeTree(items);

    // Set the dimensions and margins of the diagram
    const margin = margins ? margins : { top: 0, right: 90, bottom: 30, left: 90 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = Math.min(860, window.innerHeight - margin.top - margin.bottom);

    let hierarchy = makeHierarchy(tree, height);
    const svg = makeSvg(width, height, margin);

    // Right to left? https://klimenko.dk/blog/2021/right-to-left-d3-tree/
    // https://observablehq.com/@romaklimenko/right-to-left-tidy-tree

    let context = {
        items: items,
        treeData: tree,
        root: hierarchy,
        svg: svg,
        margin: margin,
        width: width,
        height: height,
        linkLength: width / (items.length - 1),
        idSequence: 0,
        color: color,
        fontSize: fontSize,
        isTree: false
    };
    hideSubtree(hierarchy, context)
    return context;
}

export function makeTreeContext(tree, color, linkLength, margins, fontSize) {
    // Set the dimensions and margins of the diagram
    const margin = margins ? margins : { top: 0, right: 90, bottom: 30, left: 90 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = Math.min(860, window.innerHeight - margin.top - margin.bottom);

    let hierarchy = makeHierarchy(tree, height);
    const svg = makeSvg(width, height, margin);

    let context = {
        items: [],
        treeData: tree,
        root: hierarchy,
        svg: svg,
        margin: margin,
        width: width,
        height: height,
        linkLength: linkLength ? linkLength : 180,
        idSequence: 0,
        color: color,
        fontSize: fontSize,
        isTree: true
    };
    hideSubtree(hierarchy, context)
    return context;
}

export function makeTree(strings) {

    function makeNode(item) {
        const nodeType = {
            name: "",
            children: []
        };
        const node = Object.create(nodeType);
        node.name = item
        node.children = []
        return node
    }

    let nodes = strings
        .map(function (item) {
            return makeNode(item)
        })
        .reverse()

    let treeData = null

    nodes.forEach(function (node) {
        if (treeData) {
            node.children.push(treeData)
            treeData = node
        } else {
            treeData = node
        }
    })

    return treeData;
}

// Assigns parent, children, height, depth
function makeHierarchy(data, height) {
    let hierarchy: any = d3.hierarchy(data, function (d) {
        return d.children;
    });
    hierarchy.x0 = height / 2;
    hierarchy.y0 = 0;
    return hierarchy;
}

function makeSvg(width, height, margin) {
    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    return d3.select("body").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate("
            + margin.left + "," + margin.top + ")")
}

// Collapse the node and all it's children
function collapse(d) {
    if (d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        d.children = null
    } else if (d._children) {
        d._children.forEach(collapse)
    }
}

function expand(d) {
    if (d._children) {
        d.children = d._children
        d.children.forEach(expand)
        d._children = null
    } else if (d.children) {
        d.children.forEach(expand)
    }
}

function showChildren(d, listContext) {
    if (d._children) {
        d.children = d._children;
        d._children = null;
        update(d, listContext);
    }
}

function findNode(name, nodes) {
    var current = nodes.shift();
    let nodeName = current.data.name;
    if (nodeName === name) {
        return current;
    }
    if (current.children) {
        nodes = nodes.concat(current.children);
    }
    if (current._children) {
        nodes = nodes.concat(current._children);
    }
    return findNode(name, nodes)
}

function showAll(itemName, listContext) {
    expand(listContext.root);
    let node = findNode(itemName, [listContext.root]);
    update(node.parent, listContext);
}

export function makeDFTransitions(listContext) {
    function nodes(todoList) {
        let doneList: any[] = [];
        while (todoList.length > 0) {
            const current = todoList.shift();
            if (current.children) {
                todoList = current.children.concat(todoList);
            } else if (current._children) {
                todoList = current._children.concat(todoList);
            }
            doneList.push(current)
        }
        return doneList
    }

    function compact(todoList) {
        let doneList: any[] = [];
        let doneParents: any[] = [];
        while (todoList.length > 0) {
            const current = todoList.shift();
            if (current.parent === null) {
                doneList.push(current)
            } else if (!doneParents.includes(current.parent)) {
                doneList.push(current)
                doneParents.push(current.parent)
            }
        }
        return doneList;
    }

    let nodesList = nodes([listContext.root])
    let compactList = compact(nodesList)
    let idList = compactList.map((item) => item.data.name)

    return transitionsFromList(idList, listContext);
}

export function makeBFTransitions(listContext) {
    function nodes(todoList) {
        let doneList: any[] = [];
        while (todoList.length > 0) {
            const current = todoList.shift();
            if (current.children) {
                todoList = todoList.concat(current.children);
            } else if (current._children) {
                todoList = todoList.concat(current._children);
            }
            doneList.push(current)
        }
        return doneList
    }

    function compact(todoList) {
        let doneList: any[] = [];
        let currentParent = null;
        while (todoList.length > 0) {
            const current = todoList.shift();
            if (current.parent === null) {
                doneList.push(current)
            } else if (currentParent !== current.parent) {
                doneList.push(current)
                currentParent = current.parent
            }
        }
        return doneList
    }

    let nodesList = nodes([listContext.root]);
    let compactList = compact(nodesList);
    let idList = compactList.map((item) => item.data.name);

    return transitionsFromList(idList, listContext);
}

export function makeTransitions(listContext) {
    return transitionsFromList(listContext.items, listContext);
}

function transitionsFromList(list, listContext) {
    function makeTransition(current, index) {
        return {
            transitionForward: () => addItem(current, listContext),
            transitionBackward: () => removeItem(current, listContext),
            index: index
        }
    }

    let _transitions: any[] = [];

    list.forEach(function (element, index) {
        if (index !== 0) {
            if (index === list.length - 1) {
                let transition = {
                    transitionForward: () => showAll(element, listContext),
                    transitionBackward: () => removeItem(element, listContext),
                    index: index - 1
                }
                _transitions.push(transition)
            } else {
                let transition = makeTransition(element, index - 1)
                _transitions.push(transition)
            }
        }
    })
    return _transitions;
}

function hideSubtree(subtree, listContext) {
    collapse(subtree)
    update(subtree, listContext);
}

function addItem(childName, listContext) {
    let node = findNode(childName, [listContext.root])
    if (node && node.parent) {
        showChildren(node.parent, listContext)
    }
}

function removeItem(childName, listContext) {
    let node = findNode(childName, [listContext.root])
    if (node && node.parent) {
        hideSubtree(node.parent, listContext)
    }
}

function update(source, listContext) {

    // Assigns the x and y position for the nodes
    let root = listContext.root;

    // declares a tree layout and assigns the size
    const treemap = d3.tree().size([listContext.height, listContext.width]);

    const treeData = treemap(root);

    // Compute the new tree layout.
    const nodes = treeData.descendants()
    const links = treeData.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
        d.y = d.depth * listContext.linkLength
    });

    const duration = 750

    // ****************** Nodes section ***************************

    // Update the nodes...
    const node = listContext.svg.selectAll('g.node')
        .data(nodes, function (d) {
            return d.id || (d.id = ++listContext.idSequence);
        });

    // Enter any new modes at the parent's previous position.
    const nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function (_d) {
            return "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .attr("stroke", "#24425C")
        .attr("stroke-width", "2px")

    function isParentNode(d) {
        return d.children || d._children;
    }

    function hasParent(d) {
        return d.parent;
    }

    function labelXpos(d) {
        if (listContext.isTree)
            return hasParent(d) ? (isParentNode(d) ? -10 : 16) : -20;
        else
            return 0
    }

    function labelYpos(d) {
        if (listContext.isTree)
            return hasParent(d) ? (isParentNode(d) ? -25 : 0) : 0;
        else
            return -25
    }

    function labelAnchor(d) {
        if (listContext.isTree)
            return hasParent(d) ? "start" : "end";
        else
            return "middle"
    }

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("x", (d) => labelXpos(d))
        .attr("dy", (d) => labelYpos(d))
        .attr("text-anchor", (d) => labelAnchor(d))
        .attr("fill", "#24425C")
        .style('font-size', listContext.fontSize ? listContext.fontSize : '30px')
        .style('font-family', '"Fira Sans", sans-serif')
        .style('font-weight', '400')
        .attr("alignment-baseline", 'middle')
        .text(function (d) {
            return d.data.name;
        });

    // UPDATE
    const nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
        .duration(duration)
        .attr("transform", function (d) {
            return "translate(" + d.y + "," + d.x + ")";
        });

    function fillColor(d) {
        if (d.data.color)
            return d.data.color
        return listContext.color ? listContext.color(d.data.name) : (d._children ? "#24425C" : "#fff");
    }

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
        .attr('r', 10)
        .attr("fill", d => fillColor(d))
        .attr('cursor', 'pointer');


    // Remove any exiting nodes
    const nodeExit = node.exit().transition()
        .duration(duration)
        .attr("transform", function (_d) {
            return "translate(" + source.y + "," + source.x + ")";
        })
        .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select('circle')
        .attr('r', 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select('text')
        .attr('fill-opacity', 1e-6);

    // ****************** links section ***************************

    // Update the links...
    const link = listContext.svg.selectAll('path.link')
        .data(links, function (d) {
            return d.id;
        });

    // Enter any new links at the parent's previous position.
    const linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr("fill", "none")
        .attr("stroke", "#24425C")
        .attr("stroke-width", "2px")
        .attr('d', function (_d) {
            const o = { x: source.x0, y: source.y0 };
            return diagonal(o, o)
        });

    // UPDATE
    const linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(duration)
        .attr('d', function (d) {
            return diagonal(d, d.parent)
        });

    // Remove any exiting links
    link.exit().transition()
        .duration(duration)
        .attr('d', function (_d) {
            const o = { x: source.x, y: source.y };
            return diagonal(o, o)
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach(function (d: any) {
        d.x0 = d.x;
        d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
        const path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
              ${(s.y + d.y) / 2} ${d.x},
              ${d.y} ${d.x}`

        return path;
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            hideSubtree(d, listContext);
        } else {
            showChildren(d, listContext);
        }
    }
}
