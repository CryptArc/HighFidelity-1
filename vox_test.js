var entity = Entities.addEntity({
  type: "PolyVox",
  position: Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 1, z: -3 })),
  dimensions: { x: 2, y: 2, z: 2 / 16 },
  voxelVolumeSize: { x: 16, y: 16, z: 1 },
  lifetime: 30  // Delete after 5 minutes.
});
Entities.setAllVoxels(entity, 1);
Entities.setVoxel(entity, { x: 3, y: 0, z: 0 }, 0);
