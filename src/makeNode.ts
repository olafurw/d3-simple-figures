export interface Node {
    name: string;
    children: Node[];
}

export function makeNode(item: string): Node {
    return {
        name: item,
        children: []
    } satisfies Node;
}
