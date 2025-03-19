import fs from "fs";

const itemsFile = [];

const converter = JSON.parse(fs.readFileSync(".github/scripts/data/1_8_9_to_1_21_1.json", "utf-8"))
const specialItems = JSON.parse(fs.readFileSync(".github/scripts/data/special_items.json", "utf-8"))

const lookup = converter.lookup
const ignoreDamage = converter.ignore_damage

const getItemId = (id, damage) => {
    const newId = lookup[`${id}${ignoreDamage.includes(id) || damage === 0 ? "" : `:${damage}`}`];
    if (newId === undefined) throw new Error(`Unknown item: ${id}:${damage}`)
    return newId
}

export const Items = {
    /** @param item {Item} */
    parseItem: (item) => {
        if (specialItems.items.includes(item.internalname)) return;

        const isUnbreakable = item.nbt?.Unbreakable === 1;
        const isGlowing = item.nbt?.ench !== undefined;

        let extraAttributes = item.nbt.ExtraAttributes ?? {}
        extraAttributes.id = item.internalname

        itemsFile.push({
            id: getItemId(item.itemid, item.damage),
            components: {
                'minecraft:attribute_modifiers': { modifiers: [], show_in_tooltip: false },
                'minecraft:hide_additional_tooltip': {},
                'minecraft:custom_data': extraAttributes,
                'minecraft:unbreakable': isUnbreakable ? { show_in_tooltip: false } : undefined,
                'minecraft:enchantment_glint_override': isGlowing ? true : undefined,
                'minecraft:custom_name': `'${item.displayname}'`,
                'minecraft:lore': item.lore.map(l => `'${l}'`),
                'minecraft:profile': item.nbt.SkullOwner ? {
                    properties: [
                        {
                            name: "textures",
                            value: item.nbt.SkullOwner.Properties.textures[0].Value
                        }
                    ]
                } : undefined
            }
        });
    },
    writeItems: () => {
        fs.writeFileSync("items.json", JSON.stringify(itemsFile, null, 4));
        fs.writeFileSync("cloudflare/items.min.json", JSON.stringify(itemsFile));

        return JSON.stringify(itemsFile);
    }
}