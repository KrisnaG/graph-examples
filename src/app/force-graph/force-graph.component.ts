import { AfterViewInit, Component, Input, SimpleChanges } from '@angular/core';

import * as d3 from 'd3';
import * as fg from 'force-graph';

import { createNodesAndLinksWithJunction } from '../utility';

@Component({
  selector: 'app-force-graph',
  templateUrl: './force-graph.component.html',
  styleUrl: './force-graph.component.scss',
})
export class ForceGraphComponent implements AfterViewInit {
  @Input() dataFileName: string = '';

  private HEIGHT = 800;
  private WIDTH = 1000;
  private FONT_SIZE = 12;
  private JUNCTION_BOX_SIZE = 8;
  private JUNCTION_COLOUR = '#3a3a3b';
  private JUNCTION_NAME = 'Junction'
  private BACKGROUND_COLOUR = '#101020';
  private BOUNDING_BOX_FILL = 'rgba(255, 255, 255, 0.1)';
  private BOUNDING_BOX_PADDING = 7;
  private LINK_COLOUR = 'rgba(255, 255, 255, 0.4)';
  private LINK_LABEL_COLOUR = 'rgba(255, 255, 255, 0.8)';

  private drawnGroups: Set<string> = new Set();
  private numberOfGroups = 0;
  private graphData: any = {
    nodes: [],
    links: [],
  };

  ngOnChanges(changes: SimpleChanges) {
    this.dataFileName = changes['dataFileName'].currentValue;
    this.createGraph();
  }

  ngAfterViewInit(): void {
    this.createGraph();
  }

  createGraph(): void {
    if (this.dataFileName === '') return;

    const graph = fg.default();
    this.drawnGroups.clear();

    d3.json(`../../data/${this.dataFileName}`).then((data: any) => {
      // Set our nodes and links for force graph
      this.graphData = createNodesAndLinksWithJunction(data);

      //
      this.numberOfGroups = this.countUniqueGroups(this.graphData.nodes);

      // Force Graph Component
      graph(document.getElementById('graph')!)
        // Container
        .width(this.WIDTH)
        .height(this.HEIGHT)
        .backgroundColor(this.BACKGROUND_COLOUR)
        .graphData(this.graphData)
        // Link Styling
        .linkDirectionalArrowLength(8)
        .linkDirectionalArrowRelPos(1)
        .linkDirectionalArrowColor(() => this.LINK_COLOUR)
        .linkCanvasObject((link: any, ctx: any, globalScale: any) =>
          this.createLinkObject(link, ctx, globalScale)
        )
        // Node Styling
        .nodeAutoColorBy('group')
        .nodeCanvasObject((node: any, ctx: any, globalScale: any) =>
          this.createObjectNodes(node, ctx, globalScale)
        )
        // Force Engine (d3-force)
        .d3Force('link', this.createForceLink)
        .d3Force('charge', d3.forceManyBody().strength(-500))
        .d3Force('x', d3.forceX(this.WIDTH / 2).strength(0.1))
        .d3Force('y', d3.forceY(this.HEIGHT / 2).strength(0.1))
        .cooldownTicks(50);

      // fit to canvas when engine stops
      graph.d3Force('center', null);
      graph.onEngineStop(() => graph.zoomToFit(200));
    });
  }

  /**
   * Create force link (link distance)
   */
  createForceLink = d3
    .forceLink(this.graphData.links)
    .id((d: any) => d.id)
    .distance((link: any) => {
      // Adjust the link distance based on the group of connected nodes
      const sourceGroup = link.source.group;
      const targetGroup = link.target.group;

      const distanceMultiplier =
        sourceGroup === targetGroup ? (link.name !== this.JUNCTION_NAME ? 30 : 10) : 90;

      return distanceMultiplier;
    });

  /**
   * Creates a Node element to be drawn
   */
  createObjectNodes(node: any, ctx: any, globalScale: any) {
    // Draw bounding box around nodes of the same group
    const nodesInSameGroup = this.graphData.nodes.filter(
      (n: any) => n.group === node.group
    );

    if (nodesInSameGroup.length > 1 && !this.drawnGroups.has(`${node.group}`)) {
      const groupBoundingBox = this.calculateBoundingBox(nodesInSameGroup);
      ctx.fillStyle = this.BOUNDING_BOX_FILL;
      ctx.fillRect(
        groupBoundingBox.x - node.val - this.BOUNDING_BOX_PADDING,
        groupBoundingBox.y - node.val - this.BOUNDING_BOX_PADDING,
        groupBoundingBox.width + (node.val + this.BOUNDING_BOX_PADDING) * 2,
        groupBoundingBox.height + (node.val + this.BOUNDING_BOX_PADDING) * 2
      );
    }

    this.drawnGroups.add(node.group);

    const fontSize = this.FONT_SIZE / globalScale;
    const label = node.name.startsWith(this.JUNCTION_NAME) ? '' : node.id;

    if (node.name.startsWith(this.JUNCTION_NAME)) {
      // Draw square
      ctx.fillStyle = this.JUNCTION_COLOUR;
      ctx.fillRect(
        node.x - this.JUNCTION_BOX_SIZE / 2,
        node.y - this.JUNCTION_BOX_SIZE / 2,
        this.JUNCTION_BOX_SIZE,
        this.JUNCTION_BOX_SIZE
      );
    } else {
      // Draw circle
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
      ctx.fill();
    }

    // Draw the text below the circle
    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = node.color;
    ctx.fillText(label, node.x, node.y + node.val + 2);

    // This has to be cleared otherwise it will not redraw
    if (this.drawnGroups.size == this.numberOfGroups) {
      this.drawnGroups.clear();
    }
  }

  /**
   * Creates a Link element to be drawn
   */
  createLinkObject(link: any, ctx: any, globalScale: any) {
    const fontSize = this.FONT_SIZE / globalScale;

    // Set the line style based on whether the source or target is a junction
    link.name.startsWith(this.JUNCTION_NAME) ? ctx.setLineDash([5, 5]) : ctx.setLineDash([]);
    // Draw the link line
    ctx.beginPath();
    ctx.moveTo(link.source.x, link.source.y);
    ctx.lineTo(link.target.x, link.target.y);
    ctx.strokeStyle = this.LINK_COLOUR;
    ctx.lineWidth = 1;
    ctx.stroke();


    // Draw the link label
    const label = (link.name && !link.name.startsWith(this.JUNCTION_NAME)) ? `${link.name}` : '';
    const textX = (link.source.x + link.target.x) / 2;
    const textY = (link.source.y + link.target.y) / 2;

    ctx.font = `${fontSize}px Sans-Serif`;
    ctx.fillStyle = this.LINK_LABEL_COLOUR
    ctx.fillText(label, textX, textY);
  }

  /**
   * Calculate the bounding box for a set of nodes
   */
  calculateBoundingBox(nodes: any[]): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const xValues = nodes.map((n: any) => n.x);
    const yValues = nodes.map((n: any) => n.y);

    const minX = Math.min(...xValues);
    const minY = Math.min(...yValues);
    const maxX = Math.max(...xValues);
    const maxY = Math.max(...yValues);

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Counts the number of groups
   */
  countUniqueGroups(nodeList: any[]): number {
    const uniqueGroups = new Set<string>();

    nodeList.forEach((node: any) => {
      uniqueGroups.add(node.group);
    });

    return uniqueGroups.size;
  }
}
