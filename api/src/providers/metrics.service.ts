import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderMetric } from './entities/provider-metric.entity';

type MetricField = 'profile_views' | 'clicks_whatsapp' | 'clicks_call' | 'clicks_route';

@Injectable()
export class MetricsService {
    constructor(
        @InjectRepository(ProviderMetric)
        private metricsRepo: Repository<ProviderMetric>,
    ) { }

    /**
     * Incrementa un contador de métrica para el día de hoy.
     * Usa INSERT ... ON DUPLICATE KEY UPDATE para atomicidad.
     */
    async track(providerId: number, field: MetricField): Promise<void> {
        const allowed: MetricField[] = ['profile_views', 'clicks_whatsapp', 'clicks_call', 'clicks_route'];
        if (!allowed.includes(field)) return;

        await this.metricsRepo.query(
            `INSERT INTO provider_metrics (provider_id, date, ${field})
             VALUES (?, CURDATE(), 1)
             ON DUPLICATE KEY UPDATE ${field} = ${field} + 1`,
            [providerId],
        );
    }

    /**
     * Devuelve las métricas acumuladas de los últimos 30 días para un proveedor.
     */
    async getAggregated(providerId: number): Promise<{
        profileViews: number;
        clicksWhatsapp: number;
        clicksCall: number;
        clicksRoute: number;
        totalClicks: number;
    }> {
        const rows = await this.metricsRepo.query(
            `SELECT
                COALESCE(SUM(profile_views), 0)   AS profileViews,
                COALESCE(SUM(clicks_whatsapp), 0) AS clicksWhatsapp,
                COALESCE(SUM(clicks_call), 0)     AS clicksCall,
                COALESCE(SUM(clicks_route), 0)    AS clicksRoute
             FROM provider_metrics
             WHERE provider_id = ?
               AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
            [providerId],
        );

        const r = rows[0] || {};
        const profileViews = Number(r.profileViews) || 0;
        const clicksWhatsapp = Number(r.clicksWhatsapp) || 0;
        const clicksCall = Number(r.clicksCall) || 0;
        const clicksRoute = Number(r.clicksRoute) || 0;
        const totalClicks = clicksWhatsapp + clicksCall + clicksRoute;

        return { profileViews, clicksWhatsapp, clicksCall, clicksRoute, totalClicks };
    }
}
