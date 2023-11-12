import { AfterViewInit, Component, Input } from '@angular/core';

import * as d3 from 'd3';

import { createNodesAndLinksInHierarchy } from '../utility';

@Component({
  selector: 'app-pack-with-arrow',
  templateUrl: './pack-with-arrow.component.html',
  styleUrl: './pack-with-arrow.component.scss'
})
export class PackWithArrowComponent implements AfterViewInit {
  @Input() dataFileName: string = "";

  private graphData: any;
  private height = 800;
  private width = 1000;
  private padding = 40;

  ngAfterViewInit(): void {

    d3.json(`../../data/${this.dataFileName}`).then((data: any) => {
      // Set our nodes and links for force graph
      this.graphData = createNodesAndLinksInHierarchy(data);

      const svg = d3
        .select('svg#pwa')
        .attr('width', this.width)
        .attr('height', this.height);

      const hierarchy = d3
        .hierarchy<any>(this.graphData)
        .sum((d: any) => d.value)
        .sort((a: any, b: any) => b.value + a.value);

      const pack = d3
        .pack()
        .size([this.width, this.height])
        .padding(this.padding);

      const root = pack(hierarchy);

      const nodes = root
        .descendants()
        .slice(1);

      const container = svg
        .append('g');

      const labelElements = container
        .selectAll('text')
        .data(nodes);

      labelElements
        .enter()
        .append('text')
        .text((d: any) => d.data.name)
        .attr('x', (d: any) => d.x)
        .attr('y', (d: any) => (d.children ? d.y + d.r - 15 : d.y))
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .style('fill', 'black')

      const linkElements = container
        .selectAll('path.link')
        .data(this.graphData.links);

      const linkPath = (d: any) => {
        const from: any = nodes.find((n: any) => n.data.name === d.source);
        const to: any = nodes.find((n: any) => n.data.name === d.target);

        // Calculate the distance between nodes, subtracting the sum of radii
        const length = Math.hypot(from.x - to.x, from.y - to.y);

        // Calculate the adjusted coordinates based on node radius
        const fd = from.value / length;
        const fx = from.x + (to.x - from.x) * fd + (to.x - from.x) * ((from.r - this.padding) / length);
        const fy = from.y + (to.y - from.y) * fd + (to.y - from.y) * ((from.r - this.padding) / length);

        const td = to.value / length;
        const tx = to.x + (from.x - to.x) * td + (from.x - to.x) * ((to.r - 10) / length);
        const ty = to.y + (from.y - to.y) * td + (from.y - to.y) * ((to.r - 10) / length);

        return `M ${fx},${fy} L ${tx},${ty}`;
      }

      linkElements
        .enter()
        .append('path')
        .classed('link', true)
        .attr('d', linkPath)
        .attr('marker-start', 'url(#arrowhead-from)')
        .attr('marker-end', 'url(#arrowhead-to)');

        const circles = svg
        .selectAll('.node')
        .data(nodes, (d: any) => d.data.name);

      circles.join(
        (enter: any) => enter
          .append('circle')
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y)
          .attr('r', 0)
          .attr('class', 'node')
          .attr('fill', (d: any) => (d.children ? '#bbe0e0' : '#bb6161'))
          .attr('opacity', 0.5)
          .call((enter: any) => enter.transition().attr('r', (d: any) => d.r)),
        (update: any) => update
          .call((update: any) => update
            .transition()
            .attr('cx', (d: any) => d.x)
            .attr('cy', (d: any) => d.y)
            .attr('r', (d: any) => d.r)),
        (exit: any) => exit
          .call((exit: any) => exit
            .transition()
            .attr('r', 0)
            .remove())
      );
    });
  }
}