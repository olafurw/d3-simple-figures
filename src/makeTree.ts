import { makeNode, Node } from "./makeNode"

export function makeTree(strings: string[]): Node | null {
    const nodes = strings
        .map((item) => {
            return makeNode(item)
        })
        .reverse();

    let treeData: Node | null = null;

    nodes.forEach((node) => {
        if (treeData) {
            node.children.push(treeData)
            treeData = node;
        } else {
            treeData = node;
        }
    });

    return treeData;
}
