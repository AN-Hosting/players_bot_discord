import { Colors, EmbedBuilder } from 'discord.js';
import { ActivityType } from 'discord-api-types/v10';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
export class DiscordPublisher {
    client;
    maps;
    formats;
    messageId;
    channel;
    constructor(client, maps, formats) {
        this.client = client;
        this.maps = maps;
        this.formats = formats;
        if (!process.env.DISCORD_MESSAGE_CHANNEL_ID) {
            return;
        }
        this.updateCreateStatusMessage().then((c) => {
            console.log('Created or updates initial status message...');
            this.messageId = c.messageId;
            this.channel = c.channel;
        }).catch((err) => {
            console.error('Errored while updating or creating status message, message: ' + err);
            process.exit(1);
        });
    }
    async updateCreateStatusMessage() {
        const cid = process.env.DISCORD_MESSAGE_CHANNEL_ID;
        const c = await this.client.channels.fetch(cid);
        if (!c) {
            throw new Error('Configured channel with ID ' + cid + ' is not known.');
        }
        if (!c.isSendable()) {
            throw new Error('Configured channel with ID ' + cid + ' cannot be send to.');
        }
        const configDir = './config/';
        const configFile = configDir + 'discord_message_id';
        if (existsSync(configFile)) {
            return {
                messageId: readFileSync(configFile).toString(),
                channel: c,
            };
        }
        const message = await c.send({
            embeds: [
                new EmbedBuilder()
                    .setColor(Colors.Grey)
                    .setTitle('Querying server...')
                    .setFooter({
                    text: 'Developed by FlorianSW',
                })
            ],
        });
        mkdirSync(configDir, { recursive: true });
        writeFileSync(configFile, message.id);
        return {
            messageId: message.id,
            channel: c,
        };
    }
    async publish(status) {
        const embed = new EmbedBuilder()
            .setFooter({
            text: 'Developed by FlorianSW',
        });
        if (status === undefined) {
            this.client.user?.setPresence({
                status: 'idle',
                activities: [{
                        type: ActivityType.Watching,
                        name: 'the server boot',
                    }],
            });
            this.client.user?.setStatus('dnd');
            embed
                .setColor(Colors.DarkGrey)
                .setTitle('Server is offline right now, waiting for first status');
        }
        else {
            let message = this.formats.playerCount
                .replace('${playerCount}', status.playerCount.toString())
                .replace('${maxPlayers}', status.maxPlayers.toString());
            if (status.queuedPlayers) {
                message = message.replace('${queuedPlayersMessage}', this.formats.queuedPlayers.replace('${queuedPlayers}', status.queuedPlayers.toString(10)));
            }
            else {
                message = message.replace('${queuedPlayersMessage}', '');
            }
            this.client.user?.setPresence({
                status: 'online',
                activities: [{
                        type: ActivityType.Playing,
                        name: message
                    }]
            });
            const fields = [{
                    name: 'Players',
                    value: message,
                    inline: false,
                }];
            if (status.map) {
                const map = this.maps.find(status.map);
                fields.push({
                    name: 'Map',
                    value: map?.name || status.map,
                    inline: false,
                });
                embed.setImage(map?.imageUrl || null);
            }
            if (status.map) {
            }
            embed
                .setTitle(status.name)
                .setColor(Colors.DarkGreen)
                .addFields(fields);
        }
        if (this.messageId) {
            const m = await this.channel?.messages.fetch(this.messageId);
            await m?.edit({
                embeds: [embed],
            });
        }
    }
    async currentStatus() {
        const guild = await this.client.guilds.cache.first();
        const member = await guild.members.fetch(this.client.user);
        if (member.presence?.status !== 'online' || member.presence?.activities.length !== 1) {
            return undefined;
        }
        const status = member.presence?.activities[0].name.split('/');
        if (status.length !== 2) {
            return undefined;
        }
        const secondSection = status[1].split(' ');
        const maxPlayers = parseInt(secondSection[0]);
        let queuedPlayers = undefined;
        if (secondSection.length === 2) {
            queuedPlayers = parseInt(secondSection[1]
                .replace('(', '')
                .replace('+', '')
                .replace(')', ''));
        }
        return {
            playerCount: parseInt(status[0]),
            maxPlayers: maxPlayers,
            queuedPlayers: queuedPlayers,
            name: null,
            map: null,
        };
    }
}
