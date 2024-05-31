import { Node } from "./makeNode";
import { makeTree } from "./makeTree";
import * as d3 from "d3";

export interface Box {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

function makeSvg(width: number, height: number, margin: Box) {
    // append the svg object to the body of the page
    // appends a 'group' element to 'svg'
    // moves the 'group' element to the top left margin
    return d3.select("body").append("svg")
        .attr("width", width + margin.right + margin.left)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${String(margin.left)},${String(margin.top)})`)
}

// Assigns parent, children, height, depth
function makeHierarchy(data: Node | null, height: number) {
    if (!data) {
        throw new Error('data is null');
    }

    const x = d3.hierarchy(data, (d) => {
        return d.children;
    });
    //oli ?
    //x.x0 = height / 2;
    //x.y0 = 0;
    return x;
}

export function makeListContext(items: string[], color: d3.ScaleOrdinal<string, string>, margins: Box | undefined, fontSize: string) {
    const tree = makeTree(items);

    // Set the dimensions and margins of the diagram
    const margin = margins ? margins : { top: 0, right: 90, bottom: 30, left: 90 };
    const width = window.innerWidth - margin.left - margin.right;
    const height = Math.min(860, window.innerHeight - margin.top - margin.bottom);

    const hierarchy = makeHierarchy(tree, height);
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
