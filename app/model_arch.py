import torch
import torch.nn as nn

class ResidualConv(nn.Module):
    def __init__(self, in_c, out_c, norm=True):
        super().__init__()
        self.proj = nn.Conv2d(in_c, out_c, 1, 1, 0, bias=False) if in_c != out_c else None
        self.conv1 = nn.Conv2d(in_c, out_c, 3, 1, 1, bias=False)
        self.bn1 = nn.BatchNorm2d(out_c) if norm else nn.Identity()
        self.act = nn.GELU()
        self.conv2 = nn.Conv2d(out_c, out_c, 3, 1, 1, bias=False)
        self.bn2 = nn.BatchNorm2d(out_c) if norm else nn.Identity()

    def forward(self, x):
        identity = x if self.proj is None else self.proj(x)
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.act(out)
        out = self.conv2(out)
        out = self.bn2(out)
        return self.act(out + identity)

class DenseUNetGenerator(nn.Module):
    def __init__(self, in_channels=1, out_channels=3, base=32):
        super().__init__()
        self.down1 = self.down_block(in_channels, base, norm=False)
        self.down2 = self.down_block(base, base * 2)
        self.down3 = self.down_block(base * 2, base * 4)
        self.down4 = self.down_block(base * 4, base * 8)
        self.down5 = self.down_block(base * 8, base * 8)
        self.down6 = self.down_block(base * 8, base * 8)
        self.down7 = self.down_block(base * 8, base * 8)
        self.down8 = self.down_block(base * 8, base * 8, norm=False)

        self.up1 = self.up_block(base * 8, base * 8, drop=True)
        self.up2 = self.up_block(base * 16, base * 8, drop=True)
        self.up3 = self.up_block(base * 16, base * 8, drop=True)
        self.up4 = self.up_block(base * 16, base * 8)
        self.up5 = self.up_block(base * 16, base * 4)
        self.up6 = self.up_block(base * 8, base * 2)
        self.up7 = self.up_block(base * 4, base)

        self.final = nn.Sequential(nn.ConvTranspose2d(base * 2, out_channels, 4, 2, 1, bias=False), nn.Tanh())

    def down_block(self, in_c, out_c, norm=True):
        return nn.Sequential(
            nn.Conv2d(in_c, out_c, 4, 2, 1, bias=False),
            nn.BatchNorm2d(out_c) if norm else nn.Identity(),
            nn.GELU(),
            ResidualConv(out_c, out_c, norm=norm),
        )

    def up_block(self, in_c, out_c, drop=False):
        layers = [
            nn.ConvTranspose2d(in_c, out_c, 4, 2, 1, bias=False),
            nn.BatchNorm2d(out_c),
            nn.GELU(),
            ResidualConv(out_c, out_c),
        ]
        if drop:
            layers.append(nn.Dropout(0.5))
        return nn.Sequential(*layers)

    def forward(self, x):
        d1 = self.down1(x)
        d2 = self.down2(d1)
        d3 = self.down3(d2)
        d4 = self.down4(d3)
        d5 = self.down5(d4)
        d6 = self.down6(d5)
        d7 = self.down7(d6)
        d8 = self.down8(d7)

        u1 = self.up1(d8)
        u1 = torch.cat([u1, d7], dim=1)
        u2 = self.up2(u1)
        u2 = torch.cat([u2, d6], dim=1)
        u3 = self.up3(u2)
        u3 = torch.cat([u3, d5], dim=1)
        u4 = self.up4(u3)
        u4 = torch.cat([u4, d4], dim=1)
        u5 = self.up5(u4)
        u5 = torch.cat([u5, d3], dim=1)
        u6 = self.up6(u5)
        u6 = torch.cat([u6, d2], dim=1)
        u7 = self.up7(u6)
        u7 = torch.cat([u7, d1], dim=1)
        return self.final(u7)