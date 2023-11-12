import { AfterViewInit, Component, Input } from '@angular/core';

import * as d3 from 'd3';
import * as fg from 'force-graph';

import { createNodesAndLinksWithJunction } from '../utility';

@Component({
  selector: 'app-force-graph',
  templateUrl: './force-graph.component.html',
  styleUrl: './force-graph.component.scss'
})
export class ForceGraphComponent implements AfterViewInit {
  @Input() dataFileName: string = "";

  private graphData: any = {
    "nodes": [],
    "links": []
  }

  private height = 800;
  private width = 1000;

  ngAfterViewInit(): void {
    const graph = fg.default();

    d3.json(`../../data/${this.dataFileName}`).then((data: any) => {
      // Set our nodes and links for force graph
      this.graphData = createNodesAndLinksWithJunction(data);

      // Force Graph Component
      graph(document.getElementById('graph') !)
        .width(this.width)
        .height(this.height)  
        .backgroundColor('#101020')
        .linkColor(() => 'rgba(255, 255, 255, 0.5)')
        .linkDirectionalArrowLength(6)
        .linkDirectionalArrowRelPos(1)
        .nodeLabel((node: any) => `${node.id}:${node.group}`)
        .nodeAutoColorBy('group')
        .nodeRelSize(2)
        .nodeVal((node: any) => node.name.startsWith('Junction') ? node.val / 2 : node.val)
        .cooldownTicks(100)
        // Add collision and bounding box forces
        .d3Force('collide', d3.forceCollide(20))
        .d3Force('box', () => {
          const SQUARE_HALF_SIDE = graph.nodeRelSize() * 70 * 0.5;
  
          this.graphData.nodes.forEach((node: any) => {
            const x = node.x || 0, y = node.y || 0;
  
            // bounce on box walls
            if (Math.abs(x) > SQUARE_HALF_SIDE) { node.vx *= -1; }
            if (Math.abs(y) > SQUARE_HALF_SIDE) { node.vy *= -1; }
          });
        })
        .graphData(this.graphData);
      
      graph.d3Force('center', null);

      // fit to canvas when engine stops
      graph.onEngineStop(() => graph.zoomToFit(400));
    })
  }
}
