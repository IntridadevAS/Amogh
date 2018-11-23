function ComponentNodeData(name, 
    mainComponentClass,
    subComponentClass,
    source,
    destination,
    ownerId,
    nodeId)
{
    this.Name = name;    
    this.MainComponentClass = mainComponentClass;
    this.SubComponentClass = subComponentClass;
    this.Source =source;
    this.Destination =destination;
    this.OwnerId =ownerId;
    this.NodeId = nodeId;
}