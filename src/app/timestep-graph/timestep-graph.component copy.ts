import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild
} from '@angular/core';

import * as d3 from 'd3';

import {
  createInputOutputNodesAndLinks
} from '../utility';

@Component({
  selector: 'app-timestep-graph',
  templateUrl: './timestep-graph.component.html',
  styleUrl: './timestep-graph.component.scss'
})
export class TimestepGraphComponent implements AfterViewInit {
  @Input() dataFileName: string = '';
  @ViewChild('svgElement', {
    static: true
  }) svgElement: ElementRef < SVGElement > | undefined;

  private graphData: any = {
    nodes: [],
    links: [],
  };

  ngAfterViewInit(): void {
    this.createGraph();
  }

  createGraph(): void {
    if (this.dataFileName === '' || !this.svgElement) return;

    const svg = d3.select(this.svgElement.nativeElement);
    const width = 1200;
    const height = 900;

    d3.json(`../../data/${this.dataFileName}`).then((data: any) => {
      // Set our nodes and links for force graph
      this.graphData = createInputOutputNodesAndLinks(data);

      svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', [0, 0, width, height])

      const simulation = d3.forceSimulation(this.graphData.nodes)
        .force('link', d3.forceLink(this.graphData.links).id((d: any) => d.id))

      const groups = ['Defender', 'Attacker'];

      const links = svg.selectAll('line')
        .data(this.graphData.links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke', 'blue')
        .join('line')

      const nodes = svg.selectAll('.node')
        .data(this.graphData.nodes)
        .enter()
        .append("g")
        .attr('class', 'node')
        .attr('class', (d: any) => d.id.startsWith('Input') ? 'node': 'node');

      // svg.selectAll(".rect").append("rect");
      nodes.append('circle').attr('r', 15);

      // Create circles for nodes
      // nodes.append('circle')
      // .attr('class', 'node-shape')
      // .attr('r', 15)
      // .attr('fill', (d: any) => (d.group === 'Defender') ? 'blue' : 'red')
      // .classed('square-shape', (d: any) => d.name.startsWith('Input'));

      // Create text labels for nodes
      nodes.append('text')
        .text((d: any) => d.name)
        .attr('dx', 25)


      const groupRects = svg.selectAll('.group')
        .data(groups)
        .enter()
        .append('rect')
        .attr('class', 'group')
        .attr('fill', 'none')
        .attr('stroke', 'gray')
        .attr('stroke-width', 2);


      const groupSpacing = 200;
      const columnSpacing = 100;

      // Group nodes by their 'group' property
      const groupedNodes = d3.group(this.graphData.nodes, (d: any) => d.group);

      // Calculate positions for nodes within groups and columns
      let x = 100;
      let y = 50;
      const columnWidth = 200;

      groupedNodes.forEach((group, groupName) => {
        const nodesInGroup = group as any[]; // Assuming 'group' is an array of nodes

        // Sort nodes within each group by their 'id' for consistent ordering
        nodesInGroup.sort((a: any, b: any): number => {
          const idA = a.id.toLowerCase();
          const idB = b.id.toLowerCase();

          // Extract the prefixes
          const A = idA.split('-');
          const B = idB.split('-');

          const postA = A[1] ? A[1] : A[0]
          const postB = B[1] ? B[1] : B[0]

          if (postA < postB) {
            return -1;
          }

          if (postA > postB) {
            return 1;
          }

          if (idA < idB) {
            return -1;
          }

          if (idA > idB) {
            return 1;
          }

          return 0;
        });

        nodesInGroup.forEach((node, i) => {
          const columnIndex = i % 3; // Distribute nodes in three columns

          // Adjust the x position based on the column and column spacing
          const xPos = x + columnIndex * columnWidth + columnIndex * columnSpacing;

          // Increment y position for the next node in the column
          y += i > 0 && columnIndex === 0 ? 50 : 0; // Adjust vertical spacing within columns

          // Set node position
          node.x = xPos;
          node.y = y;
        });

        // Adjust y position for the next group
        y += groupSpacing;
      });

      // Update link positions
      svg.selectAll('.link')
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      // Update node positions
      svg.selectAll('.node')
        .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });
  }
}
