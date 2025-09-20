import { Component, BaseComponent } from "@flamework/components";
import { OnStart } from "@flamework/core";

interface WeldableInstance extends BasePart {}

interface Attributes {}

@Component({
  tag: "Weldable",
})
export class Weldable extends BaseComponent<Attributes, WeldableInstance> {
  private weld: WeldConstraint | undefined;

  public weldTo(part: BasePart, offset?: CFrame) {
    if (this.weld) {
      this.weld.Part1 = part;
      return;
    }

    if (offset) {
      this.instance.PivotTo(offset);
    }

    this.weld = new Instance("WeldConstraint");
    this.weld.Part0 = this.instance;
    this.weld.Part1 = part;
    this.weld.Parent = this.instance;
  }

  public unWeld(dropLocation?: CFrame) {
    if (this.weld) {
      this.weld.Destroy();
      this.weld = undefined;
    }

    if (dropLocation) {
      this.instance.PivotTo(dropLocation);
    }
  }
}